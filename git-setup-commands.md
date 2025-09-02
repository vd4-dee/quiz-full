# Git Setup Commands

## 1. Cấu hình Git (chạy lần đầu)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 2. Kiểm tra cấu hình
```bash
git config --list
```

## 3. Khởi tạo repository
```bash
git init
```

## 4. Tạo .gitignore file
```bash
# Tạo file .gitignore
echo "node_modules/" > .gitignore
echo "dist/" >> .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore
echo ".DS_Store" >> .gitignore
echo "Thumbs.db" >> .gitignore
```

## 5. Thêm files vào staging
```bash
git add .
```

## 6. Commit đầu tiên
```bash
git commit -m "Initial commit: Quiz application with question display fix"
```

## 7. Tạo repository trên GitHub
- Truy cập https://github.com
- Click "New repository"
- Đặt tên: "app-quiz"
- Chọn "Public" hoặc "Private"
- KHÔNG tích "Initialize with README"

## 8. Kết nối với GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/app-quiz.git
```

## 9. Push lên GitHub
```bash
git branch -M main
git push -u origin main
```

## 10. Commit các thay đổi tiếp theo
```bash
git add .
git commit -m "Fix: Question display bug with comprehensive debugging"
git push
```
