# 认证修复测试步骤

## 问题描述
用户在添加产品时点击保存后会被重定向到登录页面，产品也没有被成功添加。

## 根本原因
Token key 不一致导致认证失败：
- 登录API和cookie使用 `admin-token`
- 登录页面存储为 `authToken` 
- 各个admin页面查找 `authToken`
- 导致认证检查失败，重定向到登录页面

## 已修复的文件
1. `/src/app/login/page.tsx` - 修复token存储key
2. `/src/hooks/useAuth.ts` - 修复token查找key
3. `/src/app/admin/page.tsx` - 修复logout函数
4. `/src/app/admin/settings/page.tsx` - 修复logout函数
5. `/src/app/admin/products/page.tsx` - 修复所有token引用
6. `/src/app/admin/products/create/page.tsx` - 已经使用正确的key

## 测试步骤
1. 清除浏览器localStorage和sessionStorage
2. 访问 `/login`
3. 使用默认登录信息：
   - Email: admin@oishine.com
   - Password: admin123
4. 登录成功后应该跳转到 `/admin`
5. 访问 `/admin/products/create`
6. 填写产品信息：
   - Nama Produk: Test Product
   - Harga: 10000
   - Kategori: 选择任意分类
   - Deskripsi: Test description
7. 点击 "Simpan Produk"
8. 应该显示 "Produk berhasil ditambahkan!" 并跳转到产品列表

## 预期结果
- 不再被重定向到登录页面
- 产品成功添加到数据库
- 页面正常跳转到 `/admin/products`

## 数据库检查
```sql
SELECT * FROM Product ORDER BY createdAt DESC LIMIT 1;
```

## 认证流程
1. 登录时API设置cookie `admin-token`
2. 登录页面同时存储到localStorage/sessionStorage
3. 所有admin页面现在统一使用 `admin-token` key
4. API请求通过Authorization header或cookie验证