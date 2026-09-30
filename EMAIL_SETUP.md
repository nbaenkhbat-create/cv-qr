# Gmail шууд илгээх (EmailJS) — 5 минут

Browser-ээс шууд inbox руу имэйл очихын тулд **EmailJS** (үнэгүй) тохируулна.

Тохируулаагүй үед систем **Gmail compose** нээнэ → чи «Илгээх» дарна → ажил хайгчид очно.

## Алхам

1. https://www.emailjs.com/ → Sign Up (үнэгүй)
2. **Email Services** → Add Service → **Gmail** → Connect (өөрийн Gmail)
3. **Email Templates** → Create New Template:

| Field | Value |
|--------|--------|
| To Email | `{{to_email}}` |
| Subject | `{{subject}}` |
| Content | `{{message}}` |

4. **Account** → General → **Public Key** хуул
5. Төслийн үндсэн хавтсанд `.env` файл үүсгэ:

```env
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxx
```

6. Local:

```bash
npm run dev
```

7. GitHub Pages дээр: Repo → Settings → Secrets and variables → Actions → Variables  
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`  
   Дараа нь workflow-д эдгээрийг build үед оруулна (доорх).

## GitHub Actions (автомат deploy)

`.github/workflows/deploy-pages.yml` дотор build-ийн өмнө:

```yaml
- name: Create env
  run: |
    echo "VITE_EMAILJS_SERVICE_ID=${{ vars.VITE_EMAILJS_SERVICE_ID }}" >> .env
    echo "VITE_EMAILJS_TEMPLATE_ID=${{ vars.VITE_EMAILJS_TEMPLATE_ID }}" >> .env
    echo "VITE_EMAILJS_PUBLIC_KEY=${{ vars.VITE_EMAILJS_PUBLIC_KEY }}" >> .env
```

EmailJS тохируулсны дараа «Илгээх · Зөвшөөрөх» дарвал ажил хайгчийн Gmail **шууд** ирнэ.
