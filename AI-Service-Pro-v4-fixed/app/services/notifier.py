import json
import smtplib
import uuid
from datetime import datetime, timezone
from email.mime.text import MIMEText
from pathlib import Path
from typing import Iterable

from app.core.config import get_settings
from app.schemas.common import NotificationOut


class NotificationCenter:
    """Small notification store for the separated AI service.

    It keeps the NestJS/backend communication module untouched by storing AI
    notifications as JSON files under output/reports. The shape is frontend-ready
    and can later be replaced by a DB table without changing API consumers.
    """

    def __init__(self):
        self.settings = get_settings()

    def _path(self, business_id: str) -> Path:
        return self.settings.output_dir / 'reports' / f'notifications_{business_id}.json'

    def _normalize(self, business_id: str, item: dict) -> dict:
        # Backward compatibility with old saved notifications.
        item.setdefault('id', str(uuid.uuid4()))
        item.setdefault('businessId', business_id)
        item.setdefault('read', False)
        item.setdefault('category', item.get('meta', {}).get('category', 'system'))
        item.setdefault('priority', self._priority_from_level(item.get('level', 'info')))
        item.setdefault('source', 'ai_engine')
        item.setdefault('actionLabel', None)
        item.setdefault('actionUrl', None)
        item.setdefault('score', item.get('meta', {}).get('score'))
        item.setdefault('sent', False)
        item.setdefault('channel', 'dashboard')
        item.setdefault('meta', {})
        return item

    @staticmethod
    def _priority_from_level(level: str) -> int:
        return {'critical': 5, 'warning': 4, 'info': 2}.get(level, 3)

    def load(self, business_id: str, include_read: bool = True, limit: int = 200) -> list[dict]:
        p = self._path(business_id)
        if not p.exists():
            return []
        try:
            raw = json.loads(p.read_text(encoding='utf-8'))
        except json.JSONDecodeError:
            return []
        items = [self._normalize(business_id, x) for x in raw if isinstance(x, dict)]
        if not include_read:
            items = [x for x in items if not x.get('read', False)]
        return items[:limit]

    def list_response(self, business_id: str, include_read: bool = True, limit: int = 50) -> dict:
        all_items = self.load(business_id, include_read=True, limit=200)
        visible = all_items if include_read else [x for x in all_items if not x.get('read', False)]
        return {
            'businessId': business_id,
            'total': len(all_items),
            'unread': sum(1 for x in all_items if not x.get('read', False)),
            'items': visible[:limit],
        }

    def store(self, notification: NotificationOut) -> None:
        p = self._path(notification.businessId)
        items = self.load(notification.businessId, include_read=True, limit=200)
        payload = notification.model_dump(mode='json')

        # Simple dedupe: avoid repeating the same AI alert on every scheduler run.
        dedupe_key = payload.get('meta', {}).get('dedupeKey')
        if dedupe_key:
            items = [x for x in items if x.get('meta', {}).get('dedupeKey') != dedupe_key]

        items.insert(0, payload)
        p.write_text(json.dumps(items[:200], indent=2, ensure_ascii=False), encoding='utf-8')

    def _save_items(self, business_id: str, items: Iterable[dict]) -> None:
        p = self._path(business_id)
        p.write_text(json.dumps(list(items)[:200], indent=2, ensure_ascii=False), encoding='utf-8')

    def unread_count(self, business_id: str) -> int:
        return sum(1 for x in self.load(business_id) if not x.get('read', False))

    def mark_read(self, business_id: str, notification_id: str | None = None) -> int:
        items = self.load(business_id)
        affected = 0
        for item in items:
            if notification_id is None or item.get('id') == notification_id:
                if not item.get('read', False):
                    item['read'] = True
                    affected += 1
        self._save_items(business_id, items)
        return affected

    def delete(self, business_id: str, notification_id: str) -> int:
        items = self.load(business_id)
        kept = [x for x in items if x.get('id') != notification_id]
        self._save_items(business_id, kept)
        return len(items) - len(kept)

    def clear(self, business_id: str, only_read: bool = False) -> int:
        items = self.load(business_id)
        if only_read:
            kept = [x for x in items if not x.get('read', False)]
        else:
            kept = []
        self._save_items(business_id, kept)
        return len(items) - len(kept)

    def email(self, recipient: str, notification: NotificationOut) -> bool:
        if not self.settings.ENABLE_EMAIL_NOTIFICATIONS or not recipient:
            return False
        body = (
            f"{notification.title}\n\n"
            f"{notification.message}\n\n"
            f"Niveau: {notification.level}\n"
            f"Priorité: {notification.priority}/5\n"
            f"Action: {notification.actionLabel or 'Consulter le dashboard AI'}"
        )
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

    def create(
        self,
        business_id: str,
        level: str,
        title: str,
        message: str,
        channel: str = 'dashboard',
        meta: dict | None = None,
        *,
        category: str = 'system',
        priority: int | None = None,
        action_label: str | None = None,
        action_url: str | None = None,
        source: str = 'ai_engine',
        score: float | None = None,
    ) -> NotificationOut:
        note = NotificationOut(
            id=str(uuid.uuid4()),
            businessId=business_id,
            level=level,
            title=title,
            message=message,
            createdAt=datetime.now(timezone.utc),
            channel=channel,
            sent=False,
            read=False,
            category=category,
            priority=priority or self._priority_from_level(level),
            actionLabel=action_label,
            actionUrl=action_url,
            source=source,
            score=score,
            meta=meta or {},
        )
        self.store(note)
        return note
