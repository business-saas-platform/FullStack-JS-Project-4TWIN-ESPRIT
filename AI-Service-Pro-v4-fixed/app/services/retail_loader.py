from pathlib import Path

import pandas as pd


class RetailDatasetLoader:
    def __init__(self, dataset_path: str):
        self.dataset_path = Path(dataset_path)

    def load(self) -> pd.DataFrame:
        if not self.dataset_path.exists():
            return pd.DataFrame()
        sheets = pd.read_excel(self.dataset_path, sheet_name=None)
        frames = []
        for sheet_name, df in sheets.items():
            if df.empty:
                continue
            cur = df.copy()
            cur.columns = [str(c).strip().replace(' ', '_') for c in cur.columns]
            cur['source_sheet'] = sheet_name
            frames.append(cur)
        if not frames:
            return pd.DataFrame()
        data = pd.concat(frames, ignore_index=True)
        rename_map = {
            'Invoice': 'invoice_no',
            'InvoiceDate': 'invoice_date',
            'Customer_ID': 'customer_id',
            'Price': 'unit_price',
            'Quantity': 'quantity',
            'Description': 'description',
            'Country': 'country',
        }
        data = data.rename(columns=rename_map)
        if 'invoice_date' in data.columns:
            data['invoice_date'] = pd.to_datetime(data['invoice_date'], errors='coerce')
        if 'quantity' in data.columns and 'unit_price' in data.columns:
            data['amount'] = data['quantity'].fillna(0) * data['unit_price'].fillna(0)
        return data
