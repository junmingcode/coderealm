import requests
import re
import time
import html
from datetime import datetime
from urllib.parse import urljoin
import sys

# 忽略 SSL 证书警告
requests.packages.urllib3.disable_warnings()

BASE_URL = "https://zhiqiu.top/"
LOCAL_API = "http://127.0.0.1:8000/api"

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
})


def fetch_html(url):
    """获取网页 HTML"""
    try:
        resp = session.get(url, verify=False, timeout=15)
        resp.encoding = "utf-8"
        return resp.text
    except Exception as e:
        print(f"  [错误] 获取失败: {url} - {e}")
        return None


def parse_article_list(html_text):
    """解析文章列表页，返回文章基本信息列表"""
    articles = []
    if not html_text:
        return articles

    # 匹配每个文章块
    pattern = r'<div class="post item">(.*?)<\/div>\s*<\/div>'
    blocks = re.findall(pattern, html_text, re.DOTALL)

    for block in blocks:
        # 标题和链接
        title_match = re.search(r'<h2><a href="(.*?)">(.*?)<\/a><\/h2>', block)
        if not title_match:
            continue
        url = title_match.group(1)
        title = html.unescape(title_match.group(2).strip())

        # 日期
        date_match = re.search(r'<span class="datetime"> \((.*?)\)<\/span>', block)
        date_str = date_match.group(1) if date_match else ""

        # 分类
        cate_match = re.search(r'<span class="cate"><a href=".*?">(.*?)<\/a><\/span>', block)
        category = cate_match.group(1) if cate_match else "未分类"

        # 浏览量
        view_match = re.search(r'<span class="view">(\d+)<\/span>', block)
        view_count = int(view_match.group(1)) if view_match else 0

        # 摘要
        intro_match = re.search(r'<div class="intro[^"]*">(.*?)<\/div>', block, re.DOTALL)
        summary = ""
        if intro_match:
            summary = re.sub(r'<.*?>', '', intro_match.group(1))
            summary = html.unescape(summary.strip())

        articles.append({
            "url": url if url.startswith("http") else urljoin(BASE_URL, url),
            "title": title,
            "date": date_str,
            "category": category,
            "view_count": view_count,
            "summary": summary,
        })

    return articles


def parse_article_detail(html_text):
    """解析文章详情页，返回完整内容"""
    if not html_text:
        return None

    # 提取标题 - Z-Blog 详情页标题在 <div class="post"> 内的 <h1>
    title_match = re.search(r'<div class="post"[^>]*>.*?<h1[^>]*>(.*?)<\/h1>', html_text, re.DOTALL)
    if not title_match:
        title_match = re.search(r'<h1[^>]*>(.*?)<\/h1>', html_text, re.DOTALL)
    title = html.unescape(re.sub(r'<.*?>', '', title_match.group(1)).strip()) if title_match else ""

    # 提取内容 - Z-Blog 拓源主题内容在 .single.viewall 内
    content_match = re.search(r'<div class="single viewall"[^>]*>(.*?)<\/div>\s*(?:<div class="copynotice|<div class="tags|<div class="post-related)', html_text, re.DOTALL)
    if not content_match:
        content_match = re.search(r'<div class="single"[^>]*>(.*?)<\/div>\s*(?:<div class="copynotice|<div class="tags)', html_text, re.DOTALL)
    if not content_match:
        content_match = re.search(r'<div class="post-con"[^>]*>(.*?)<\/div>', html_text, re.DOTALL)

    content = content_match.group(1).strip() if content_match else ""

    # 提取标签
    tags = []
    tag_section = re.search(r'<div class="tags"[^>]*>(.*?)<\/div>', html_text, re.DOTALL)
    if tag_section:
        tag_links = re.findall(r'<a[^>]*>(.*?)<\/a>', tag_section.group(1))
        tags = [html.unescape(t.strip()) for t in tag_links if t.strip()]

    return {
        "title": title,
        "content": content,
        "tags": tags,
    }


def parse_total_pages(html_text):
    """解析总页数"""
    if not html_text:
        return 1
    # 查找尾页链接
    last_match = re.search(r'<a href="\?page=(\d+)"[^>]*>尾页<\/a>', html_text)
    if last_match:
        return int(last_match.group(1))
    # 或者查找最大的 page 数字
    pages = re.findall(r'\?page=(\d+)', html_text)
    if pages:
        return max(int(p) for p in pages)
    return 1


def create_category(name, local_api):
    """通过 API 创建分类"""
    try:
        # 先检查分类是否已存在
        resp = requests.get(f"{local_api}/categories", timeout=10)
        if resp.status_code == 200:
            existing = resp.json()
            for cat in existing:
                if cat.get("name") == name:
                    return cat.get("id")
    except:
        pass

    # 直接插入数据库
    return None


def migrate_articles():
    """主迁移函数"""
    print("=" * 60)
    print("开始抓取 zhiqiu.top 博客数据")
    print("=" * 60)

    # 1. 获取首页，解析总页数
    print("\n[1/4] 获取文章列表信息...")
    first_page = fetch_html(BASE_URL)
    total_pages = parse_total_pages(first_page)
    print(f"  发现 {total_pages} 页文章")

    # 2. 抓取所有文章列表
    all_articles = []
    first_list = parse_article_list(first_page)
    all_articles.extend(first_list)
    print(f"  第 1 页: {len(first_list)} 篇文章")

    for page in range(2, total_pages + 1):
        url = f"{BASE_URL}?page={page}"
        html_text = fetch_html(url)
        articles = parse_article_list(html_text)
        all_articles.extend(articles)
        print(f"  第 {page} 页: {len(articles)} 篇文章")
        time.sleep(0.5)  # 避免请求过快

    print(f"\n  总计抓取 {len(all_articles)} 篇文章")

    # 3. 抓取每篇文章详情
    print("\n[2/4] 抓取文章详情...")
    detailed_articles = []
    for i, article in enumerate(all_articles, 1):
        print(f"  [{i}/{len(all_articles)}] {article['title'][:40]}...", end=" ")
        detail = parse_article_detail(fetch_html(article["url"]))
        if detail:
            article.update(detail)
            detailed_articles.append(article)
            print("OK")
        else:
            print("FAIL (内容为空)")
        time.sleep(0.3)

    print(f"\n  成功获取 {len(detailed_articles)} 篇文章详情")

    # 4. 保存到本地 JSON 文件（供后续导入）
    import json
    output_file = "zhiqiu_articles.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(detailed_articles, f, ensure_ascii=False, indent=2)
    print(f"\n[3/4] 数据已保存到 {output_file}")

    # 5. 导入到本地数据库
    print("\n[4/4] 导入到本地数据库...")
    import_to_local(detailed_articles)

    print("\n" + "=" * 60)
    print("数据迁移完成!")
    print("=" * 60)


def import_to_local(articles):
    """导入到本地数据库"""
    try:
        from app.database import SessionLocal, engine
        from app.models import Article, Category, Tag, User, article_tags
        from app.services.article_service import create_article
        from app.schemas import ArticleCreate
        from slugify import slugify
        from sqlalchemy import func
    except ImportError:
        print("  [错误] 无法导入本地模块，请确保在 backend 目录下运行")
        sys.path.insert(0, ".")
        from app.database import SessionLocal, engine
        from app.models import Article, Category, Tag, User, article_tags
        from app.services.article_service import create_article
        from app.schemas import ArticleCreate
        from slugify import slugify
        from sqlalchemy import func

    db = SessionLocal()
    try:
        # 确保有管理员用户
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            print("  [错误] 未找到管理员用户，请先启动一次后端服务创建默认用户")
            return

        # 收集所有分类
        categories = {}
        for article in articles:
            cat_name = article.get("category", "未分类")
            if cat_name not in categories:
                # 检查是否已存在
                existing = db.query(Category).filter(Category.name == cat_name).first()
                if existing:
                    categories[cat_name] = existing.id
                else:
                    new_cat = Category(
                        name=cat_name,
                        slug=slugify(cat_name),
                    )
                    db.add(new_cat)
                    db.flush()
                    categories[cat_name] = new_cat.id
                    print(f"  创建分类: {cat_name}")

        db.commit()

        # 导入文章
        imported = 0
        skipped = 0
        for article in articles:
            title = article.get("title", "")
            if not title:
                continue

            # 检查是否已存在
            existing = db.query(Article).filter(Article.title == title).first()
            if existing:
                skipped += 1
                continue

            slug = slugify(title)
            # 确保 slug 唯一
            slug_count = db.query(func.count(Article.id)).filter(Article.slug == slug).scalar()
            if slug_count > 0:
                slug = f"{slug}-{slug_count + 1}"

            cat_name = article.get("category", "未分类")
            category_id = categories.get(cat_name)

            # 解析日期
            date_str = article.get("date", "")
            published_at = None
            if date_str:
                try:
                    # 尝试各种日期格式
                    for fmt in ["%Y-%m-%d", "%Y-%m-%d %H:%M", "%m-%d", "%Y/%m/%d"]:
                        try:
                            if len(date_str) <= 5:  # 只有月-日，补上年份
                                date_str = f"2025-{date_str}"
                            published_at = datetime.strptime(date_str, fmt)
                            break
                        except:
                            continue
                except:
                    published_at = datetime.now()
            if not published_at:
                published_at = datetime.now()

            # 处理标签
            tag_ids = []
            for tag_name in article.get("tags", []):
                if not tag_name:
                    continue
                existing_tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if existing_tag:
                    tag_ids.append(existing_tag.id)
                else:
                    new_tag = Tag(name=tag_name, slug=slugify(tag_name))
                    db.add(new_tag)
                    db.flush()
                    tag_ids.append(new_tag.id)

            # 创建文章
            new_article = Article(
                title=title,
                slug=slug,
                content=article.get("content", article.get("summary", "")),
                summary=article.get("summary", "")[:500],
                status="published",
                view_count=article.get("view_count", 0),
                category_id=category_id,
                user_id=admin.id,
                created_at=published_at,
                published_at=published_at,
            )
            db.add(new_article)
            db.flush()

            # 关联标签
            if tag_ids:
                for tid in tag_ids:
                    db.execute(article_tags.insert().values(article_id=new_article.id, tag_id=tid))

            imported += 1
            if imported % 10 == 0:
                print(f"  已导入 {imported}/{len(articles)} 篇文章...")

        db.commit()
        print(f"\n  导入完成: {imported} 篇成功, {skipped} 篇跳过(已存在)")

    except Exception as e:
        db.rollback()
        print(f"  [错误] 导入失败: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    migrate_articles()
