from datetime import datetime

from PIL import Image, ImageDraw, ImageFont

from app.core.config import get_settings
from app.schemas.common import SummaryOut


class BusinessImageGenerator:
    def __init__(self):
        self.settings = get_settings()

    def _font(self, size: int):
        try:
            return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', size)
        except Exception:
            return ImageFont.load_default()

    def create_summary_card(self, summary: SummaryOut) -> str:
        img = Image.new('RGB', (1400, 800), (15, 23, 42))
        draw = ImageDraw.Draw(img)
        title_font = self._font(52)
        big_font = self._font(40)
        text_font = self._font(28)
        small_font = self._font(22)

        draw.rounded_rectangle((40, 40, 1360, 760), radius=30, fill=(30, 41, 59))
        draw.text((80, 80), f'AI Business Report — {summary.businessName}', font=title_font, fill=(255, 255, 255))
        draw.text((80, 150), f'Generated: {summary.generatedAt.strftime("%Y-%m-%d %H:%M")}', font=small_font, fill=(191, 219, 254))

        cards = [
            ('Revenue', f'{summary.totalRevenue:,.2f}'),
            ('Expenses', f'{summary.totalExpenses:,.2f}'),
            ('Forecast 30d', f'{summary.forecast30d:,.2f}'),
            ('Overdue', str(summary.overdueInvoices)),
        ]
        x = 80
        for title, value in cards:
            draw.rounded_rectangle((x, 220, x + 280, 380), radius=24, fill=(59, 130, 246))
            draw.text((x + 24, 250), title, font=text_font, fill=(255, 255, 255))
            draw.text((x + 24, 305), value, font=big_font, fill=(255, 255, 255))
            x += 310

        draw.text((80, 450), 'Top recommendations', font=big_font, fill=(255, 255, 255))
        y = 505
        for rec in summary.topRecommendations[:5]:
            draw.text((95, y), f'• {rec}', font=text_font, fill=(226, 232, 240))
            y += 46

        draw.text((760, 450), 'Client segments', font=big_font, fill=(255, 255, 255))
        y = 505
        for label, count in summary.clientSegments.items():
            draw.text((775, y), f'• {label}: {count}', font=text_font, fill=(226, 232, 240))
            y += 46

        path = self.settings.output_dir / 'images' / f'summary_{summary.businessId}_{datetime.utcnow().strftime("%Y%m%d%H%M%S")}.png'
        img.save(path)
        return str(path)
