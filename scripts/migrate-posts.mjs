import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, basename } from 'path'
import { globSync } from 'glob'
import matter from 'gray-matter'

const SOURCE_DIR = '/Users/chialin/Documents/2-Areas/chialin-blog/data/blog'
const DEST_DIR = 'src/content/posts'

mkdirSync(DEST_DIR, { recursive: true })

const files = globSync('**/*.mdx', { cwd: SOURCE_DIR })
let count = 0

for (const file of files) {
  const content = readFileSync(join(SOURCE_DIR, file), 'utf-8')
  const { data, content: body } = matter(content)

  const slug = basename(file, '.mdx')

  // Transform image: skip twitter-card placeholder, remap path
  let image = ''
  if (Array.isArray(data.images) && data.images.length > 0) {
    const raw = data.images[0]
    if (raw && !raw.includes('twitter-card')) {
      image = raw.replace('/static/images/', '/images/')
    }
  }

  // Ensure date is YYYY-MM-DD string
  const dateObj = new Date(data.date)
  const dateStr = dateObj.toISOString().split('T')[0]

  const newFrontmatter = {
    title: data.title,
    slug,
    description: data.summary || '',
    date: dateStr,
    ...(image ? { image } : {}),
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
    categories: ['others'],
    authors: ['chialin'],
    draft: data.draft || false,
  }

  const newFilename = `${dateStr}-${slug}.md`
  const newContent = matter.stringify(body.trimStart(), newFrontmatter)
  writeFileSync(join(DEST_DIR, newFilename), newContent)
  console.log(`✓ ${file} → ${newFilename}`)
  count++
}

console.log(`\n完成：共遷移 ${count} 篇文章`)
