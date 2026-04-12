from pathlib import Path
import shutil

src = Path('/mnt/data/online_retail_II.xlsx')
dst = Path(__file__).resolve().parents[1] / 'data' / 'online_retail_II.xlsx'
if src.exists():
    shutil.copy2(src, dst)
    print(f'Copied dataset to {dst}')
else:
    print('Dataset not found at /mnt/data/online_retail_II.xlsx')
