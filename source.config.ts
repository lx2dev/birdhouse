import { remarkMdxFiles } from "fumadocs-core/mdx-plugins"
import { metaSchema, pageSchema } from "fumadocs-core/source/schema"
import { defineConfig, defineDocs } from "fumadocs-mdx/config"
import lastModified from "fumadocs-mdx/plugins/last-modified"

export default defineConfig({
  mdxOptions: {
    rehypeCodeOptions: {
      inline: "tailing-curly-colon",
      themes: {
        dark: "dracula",
        light: "github-light",
      },
    },
    remarkPlugins: [remarkMdxFiles],
  },
  plugins: [lastModified()],
})

export const docs = defineDocs({
  dir: "src/content/docs",
  docs: {
    postprocess: {
      includeProcessedMarkdown: true,
    },
    schema: pageSchema,
  },
  meta: {
    schema: metaSchema,
  },
})
