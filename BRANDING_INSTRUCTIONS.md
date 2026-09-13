# دليل تغيير هوية التطبيق (Branding Guide)

لتغيير اللوجو والأيقونات الخاصة بمشروع **SevenText** في جميع المنصات لتصبح بصورك الخاصة، يرجى استبدال الملفات التالية بصورك بنفس الأسماء والأبعاد (إن أمكن):

## 1. تطبيق الويب (Next.js)
الأيقونة التي تظهر في المتصفح (Favicon):
قم باستبدال الملف التالي بصورة الـ Favicon الخاصة بك (يجب أن تكون بصيغة `.ico`):
- `frontend/src/app/favicon.ico`

لوجو الموقع في شريط التنقل (Navbar):
- يمكنك إضافة صورة اللوجو (مثل `logo.png`) داخل مجلد `frontend/public/`
- ثم قم بتعديل السطر رقم 37 في ملف `frontend/src/app/layout.tsx` ليصبح كالتالي:
  ```tsx
  <img src="/logo.png" alt="SevenText Logo" className="h-8 w-auto" />
  ```
  بدلاً من:
  ```tsx
  <span className="font-bold text-xl text-blue-600">SevenText</span>
  ```

## 2. تطبيق الموبايل (React Native / Expo)
قم باستبدال الصور التالية الموجودة داخل مجلد `mobile/assets/` بصورك الخاصة (بنفس الأسماء وتنسيق `.png`):
- `mobile/assets/icon.png` (أيقونة التطبيق - حجمها المفضل 1024x1024)
- `mobile/assets/splash.png` (صورة شاشة البداية - Splash Screen)
- `mobile/assets/favicon.png` (تُستخدم كأيقونة مصغرة)
- `mobile/assets/adaptive-icon.png` (أيقونة الأندرويد المتكيفة)

## 3. تطبيق سطح المكتب (Windows / Electron)
البرنامج حالياً يسحب نفس اللوجو الخاص بالويب لأنه يغلف الموقع.
إذا كنت تريد وضع أيقونة مخصصة لملف الـ `.exe` الخاص بالويندوز (الذي يتم تثبيته)، قم بوضع ملف `icon.ico` في مجلد `desktop/` وقم بتحديث `desktop/package.json` في قسم `build` ليصبح:
```json
"build": {
  "appId": "uk.co.seventext.desktop",
  "win": {
    "target": "nsis",
    "icon": "icon.ico"
  }
}
```
