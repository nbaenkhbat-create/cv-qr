# CV QR — Нэрийн хуудас · CV · QR

Ажил олгогч ажил байр бүрт CV асуулт үүсгэж link/QR гаргана. Ажил хайгч бөглөж илгээнэ. Зөвшөөрөхөд имэйл бичнэ. CV-г QR болгож татаж, уншуулахад hide/show хийнэ.

## Live

GitHub Pages: https://nbaenkhbat-create.github.io/cv-qr/

## Ажиллуулах

```bash
npm install
npm run dev
```

## Firebase

Project: `cv-qr-6b8d4`

1. Firebase Console → Authentication → Email/Password идэвхжүүлэх
2. Firestore Database үүсгэх
3. Authorized domains-д `nbaenkhbat-create.github.io` нэмэх
4. Rules deploy:

```bash
npx firebase deploy --only firestore:rules,firestore:indexes --project cv-qr-6b8d4
```

## Нэвтрэх

- **Нэвтрэх нэр** + нууц үг
- Нууц үг мартсан → бүртгэлийн **Gmail**-ээр сэргээнэ
