import json
import os
import secrets
import psycopg2
import urllib.request
import urllib.error

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p35015978_bank_tariff_monitori')


def send_confirmation_email(to_email: str, token: str, products: list[str]) -> None:
    """Отправляет письмо с подтверждением подписки через Resend API."""
    api_key = os.environ['RESEND_API_KEY']
    confirm_url = f"https://ratewatch.poehali.dev/api/confirm?token={token}"
    products_html = ''.join(f'<li style="margin:4px 0;color:#94a3b8;">{p}</li>' for p in products)

    html = f"""
    <div style="font-family:'Segoe UI',sans-serif;background:#0b0f18;padding:40px;max-width:520px;margin:0 auto;border-radius:16px;border:1px solid #1e2a3a;">
      <div style="margin-bottom:28px;">
        <span style="font-weight:700;font-size:20px;color:#fff;">Rate<span style="background:linear-gradient(135deg,#2D8FF4,#0ECAD4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Watch</span></span>
      </div>
      <h2 style="color:#f1f5f9;font-size:22px;margin:0 0 12px;">Подтвердите подписку</h2>
      <p style="color:#94a3b8;line-height:1.6;margin:0 0 20px;">
        Вы подписались на мониторинг тарифов РКО. Как только условия в выбранных продуктах изменятся — мы пришлём уведомление.
      </p>
      <p style="color:#94a3b8;margin:0 0 8px;font-size:14px;">Выбранные продукты:</p>
      <ul style="margin:0 0 28px;padding-left:20px;">
        {products_html}
      </ul>
      <a href="{confirm_url}"
         style="display:inline-block;background:linear-gradient(135deg,#2D8FF4,#0ECAD4);color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:600;font-size:15px;">
        Подтвердить подписку
      </a>
      <p style="color:#475569;font-size:12px;margin:24px 0 0;">
        Если вы не подписывались — просто проигнорируйте это письмо.<br>Отписаться можно в любой момент.
      </p>
    </div>
    """

    payload = json.dumps({
        "from": "RateWatch <noreply@poehali.dev>",
        "to": [to_email],
        "subject": "Подтвердите подписку на мониторинг тарифов РКО",
        "html": html,
    }).encode()

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    urllib.request.urlopen(req, timeout=10)


def handler(event: dict, context) -> dict:
    """Подписка на уведомления об изменении тарифов РКО.
    POST /subscribe — принимает email и список продуктов, сохраняет в БД и отправляет письмо с подтверждением.
    GET /subscribe/confirm — подтверждает email по токену.
    """
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    conn.autocommit = True
    cur = conn.cursor()

    try:
        # --- Подтверждение email ---
        qs = event.get('queryStringParameters') or {}
        if method == 'GET' and ('confirm' in path or 'token' in qs):
            token = qs.get('token', '')
            if not token:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Токен не указан'})}

            cur.execute(
                "UPDATE " + SCHEMA + ".subscribers SET confirmed = TRUE WHERE confirm_token = %s RETURNING email",
                (token,)
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'Токен не найден или уже использован'})}

            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True, 'email': row[0]}),
            }

        # --- Новая подписка ---
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            email = (body.get('email') or '').strip().lower()
            products = body.get('products') or ['РКО']

            if not email or '@' not in email:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Некорректный email'})}

            token = secrets.token_urlsafe(32)

            cur.execute(
                "INSERT INTO " + SCHEMA + """.subscribers (email, products, confirm_token)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (email) DO UPDATE
                      SET products = EXCLUDED.products,
                          confirm_token = EXCLUDED.confirm_token,
                          confirmed = FALSE
                    RETURNING id""",
                (email, products, token)
            )

            send_confirmation_email(email, token, products)

            return {
                'statusCode': 200,
                'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
            }

        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}

    finally:
        cur.close()
        conn.close()