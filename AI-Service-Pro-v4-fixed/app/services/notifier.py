import json
import smtplib
from datetime import datetime, timezone
from email.mime.text import MIMEText
from pathlib import Path

from app.core.config import get_settings
from app.schemas.common import NotificationOut


class NotificationCenter:
    def __init__(self):
        self.settings = get_settings()

    def _path(self, business_id: str) -> Path:
        return self.settings.output_dir / 'reports' / f'notifications_{business_id}.json'

    def load(self, business_id: str):
        p = self._path(business_id)
        if not p.exists():
            return []
        return json.loads(p.read_text(encoding='utf-8'))

    def store(self, notification: NotificationOut) -> None:
        p = self._path(notification.businessId)
        items = self.load(notification.businessId)
        items.insert(0, notification.model_dump(mode='json'))
        p.write_text(json.dumps(items[:200], indent=2, ensure_ascii=False), encoding='utf-8')

    def email(self, recipient: str, notification: NotificationOut) -> bool:
        if not self.settings.ENABLE_EMAIL_NOTIFICATIONS or not recipient:
            return False
        body = f"{notification.title}\n\n{notification.message}\n\nNiveau: {notification.level}"
        msg = MIMEText(body, 'plain', 'utf-8')
        msg['Subject'] = f"[AI] {notification.title}"
        msg['From'] = self.settings.SMTP_FROM
        msg['To'] = recipient
        try:
            with smtplib.SMTP(self.settings.SMTP_HOST, self.settings.SMTP_PORT, timeout=20) as server:
                if self.settings.SMTP_TLS:
                    server.starttls()
                if self.settings.SMTP_USERNAME:
                    server.login(self.settings.SMTP_USERNAME, self.settings.SMTP_PASSWORD)
                server.sendmail(self.settings.SMTP_FROM, [recipient], msg.as_string())
            return True
        except Exception:
            return False

    def create(self, business_id: str, level: str, title: str, message: str, channel: str = 'dashboard', meta: dict | None = None) -> NotificationOut:
        note = NotificationOut(
            businessId=business_id,
            level=level,
            title=title,
            message=message,
            createdAt=datetime.now(timezone.utc),
            channel=channel,
            sent=False,
            meta=meta or {},
        )
        self.store(note)
        return note
