import { IconArrowUpRight } from "@tabler/icons-react"
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  PageLastUpdate,
  ViewOptionsPopover,
} from "fumadocs-ui/layouts/notebook/page"
import { createRelativeLink } from "fumadocs-ui/mdx"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getMDXComponents } from "@/components/mdx"
import { Button } from "@/components/ui/button"
import { REPO_URL } from "@/constants"
import { getPageImage, source } from "@/lib/source"

export default async function DocPage({
  params,
}: PageProps<"/docs/[[...slug]]">) {
  const { slug } = await params
  const page = source.getPage(slug)

  if (!page) notFound()

  const MDX = page.data.body
  const lastModifiedTime = page.data.lastModified

  return (
    <DocsPage
      full={page.data.full}
      tableOfContent={{
        footer: (
          <div className="mt-2 flex flex-col items-start">
            <Button
              className="w-fit text-muted-foreground hover:text-foreground"
              nativeButton={false}
              render={
                <Link
                  href={`${REPO_URL}/blob/main/src/content/docs/${page.path}`}
                  rel="noreferrer noopener"
                  target="_blank"
                />
              }
              size="sm"
              variant="link"
            >
              Edit on GitHub <IconArrowUpRight />
            </Button>

            {/* TODO: Scroll to top */}
            {/* <Button
              className="w-fit text-muted-foreground hover:text-foreground"
              size="sm"
              variant="link"
            >
              Scroll to top <IconCircleArrowUp />
            </Button> */}
          </div>
        ),
        single: true,
        style: "clerk",
      }}
      toc={page.data.toc}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">
        {page.data.description}
      </DocsDescription>
      <div className="flex flex-row items-center gap-2 border-b pb-6">
        <MarkdownCopyButton markdownUrl={`${page.url}.mdx`} />
        <ViewOptionsPopover
          githubUrl={`${REPO_URL}/blob/main/src/content/docs/${page.path}`}
          markdownUrl={`${page.url}.mdx`}
        />
      </div>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>

      {lastModifiedTime && <PageLastUpdate date={lastModifiedTime} />}
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({
  params,
}: PageProps<"/docs/[[...slug]]">): Promise<Metadata> {
  const { slug } = await params
  const page = source.getPage(slug)

  if (!page) notFound()

  return {
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
    title: page.data.title,
  }
}
