"""
LedgerMind AI - Bad-debt risk model

Trains an XGBoost classifier to predict the probability that an unpaid
invoice will turn into a bad debt (unrecoverable, GST already paid on it).

Label definition (derived from historical/synthetic data):
  bad_debt = 1  if invoice was unpaid for > 90 days past due_date
             (a reasonable proxy: real deployments would use actual
             write-off / credit-note history as ground truth)

Features:
  - days_overdue            : how far past due_date (0 if not yet due)
  - days_since_invoice
  - amount
  - gst_amount
  - client_avg_payment_delay_days
  - client_past_default_rate
  - sector (one-hot)
  - terms_days (payment terms length)
"""
import json
import os
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report
from datetime import date
from database import get_db

MODEL_PATH = os.path.join(os.path.dirname(__file__), "risk_model.pkl")
FEATURE_META_PATH = os.path.join(os.path.dirname(__file__), "risk_model_features.json")

TODAY = date(2026, 7, 19)


def load_dataframe():
    conn = get_db()
    df = pd.read_sql_query(
        """
        SELECT i.*, c.sector, c.avg_payment_delay_days, c.past_default_rate
        FROM invoices i
        JOIN clients c ON c.id = i.client_id
        """,
        conn,
    )
    conn.close()
    return df


def engineer_features(df):
    df = df.copy()
    df["invoice_date"] = pd.to_datetime(df["invoice_date"])
    df["due_date"] = pd.to_datetime(df["due_date"])
    df["payment_date"] = pd.to_datetime(df["payment_date"])

    today = pd.Timestamp(TODAY)
    df["days_since_invoice"] = (today - df["invoice_date"]).dt.days
    df["terms_days"] = (df["due_date"] - df["invoice_date"]).dt.days

    # days_overdue: for paid invoices, use payment_date vs due_date (could be negative = early)
    # for unpaid invoices, use today vs due_date
    def compute_overdue(row):
        if row["status"] == "paid":
            return max((row["payment_date"] - row["due_date"]).days, 0)
        else:
            return max((today - row["due_date"]).days, 0)

    df["days_overdue"] = df.apply(compute_overdue, axis=1)

    # Label: bad debt proxy.
    # - paid invoices that took >90 days overdue to actually collect => treat as "risky but recovered" (0)
    # - unpaid invoices sitting >90 days overdue => bad debt (1)
    # - everything else => 0
    df["bad_debt"] = np.where((df["status"] == "unpaid") & (df["days_overdue"] > 90), 1, 0)

    sector_dummies = pd.get_dummies(df["sector"], prefix="sector")
    feature_cols = [
        "days_since_invoice", "days_overdue", "amount", "gst_amount",
        "avg_payment_delay_days", "past_default_rate", "terms_days",
    ]
    X = pd.concat([df[feature_cols], sector_dummies], axis=1)
    y = df["bad_debt"]
    return X, y, df, list(X.columns)


def train():
    df = load_dataframe()
    X, y, full_df, feature_columns = engineer_features(df)

    if y.sum() < 3:
        print("Warning: very few positive (bad-debt) examples; model will still train "
              "but treat scores as illustrative for the demo.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y if y.sum() > 1 else None
    )

    model = XGBClassifier(
        n_estimators=150,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.9,
        colsample_bytree=0.9,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    proba = model.predict_proba(X_test)[:, 1]
    print("=== Risk model evaluation ===")
    print(classification_report(y_test, preds, zero_division=0))
    try:
        print("ROC-AUC:", round(roc_auc_score(y_test, proba), 3))
    except ValueError:
        print("ROC-AUC: N/A (only one class present in test split)")

    joblib.dump(model, MODEL_PATH)
    with open(FEATURE_META_PATH, "w") as f:
        json.dump({"columns": feature_columns}, f)

    print(f"\nModel saved to {MODEL_PATH}")

    # Score ALL invoices and write risk_score back into the DB
    X_all = X  # already engineered for full_df in same row order
    all_proba = model.predict_proba(X_all)[:, 1]
    conn = get_db()
    cur = conn.cursor()
    for inv_id, score in zip(full_df["id"], all_proba):
        cur.execute("UPDATE invoices SET risk_score = ? WHERE id = ?", (float(score), int(inv_id)))
    conn.commit()
    conn.close()
    print(f"Risk scores written for {len(full_df)} invoices.")


if __name__ == "__main__":
    train()
