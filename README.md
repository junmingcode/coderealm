# CJM Blog

个人博客系统，基于 Python FastAPI + React + MySQL 构建。

## 技术栈

- **后端**: Python 3.11 + FastAPI + SQLAlchemy + MySQL
- **前端**: React 18 + TypeScript + Vite + Zustand
- **部署**: Docker + Docker Compose + Nginx

## 功能特性

- 文章管理（Markdown 编辑器、草稿/发布状态）
- 分类与标签系统
- 评论系统（支持回复）
- 点赞与访问量统计
- 全文搜索
- 深色/浅色主题切换
- 代码高亮
- RSS 订阅
- 响应式设计
- 后台管理系统

## 快速开始

### 环境要求

- Docker & Docker Compose
- Node.js 20+ (本地开发)
- Python 3.11+ (本地开发)

### Docker 部署

```bash
cd cjm-blog
docker-compose up -d
```

访问:
- 前台: http://localhost
- 后台: http://localhost/admin
- 默认管理员: admin / admin123

### 本地开发

**后端:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**前端:**
```bash
cd frontend
npm install
npm run dev
```

## 项目结构

```
cjm-blog/
├── backend/          # FastAPI 后端
├── frontend/         # React 前端
├── nginx/            # Nginx 配置
└── docker-compose.yml
```

## 配置

编辑 `.env` 文件:
- `DATABASE_URL`: MySQL 连接地址
- `SECRET_KEY`: JWT 密钥
- `ADMIN_USERNAME`: 管理员用户名
- `ADMIN_PASSWORD`: 管理员密码

## License

MIT
