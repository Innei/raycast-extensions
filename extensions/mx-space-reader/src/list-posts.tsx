import { AggregateController, createClient } from '@mx-space/api-client'
import { axiosAdaptor } from '@mx-space/api-client/lib/adaptors/axios'
import {
  ActionPanel,
  getLocalStorageItem,
  List,
  ListSection,
  PushAction,
  render,
} from '@raycast/api'
import { FC, useEffect, useMemo, useState } from 'react'
import { MarkdownRender } from './components/markdown-render'
import { StorageServerKey, ua } from './constants'
import { useFetchData } from './use-fetch-data'

axiosAdaptor.default.defaults.headers.common['user-agent'] = ua

export const MixSitePostList = () => {
  const [urlList, setUrl] = useState([] as string[])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getLocalStorageItem(StorageServerKey)
      .then((string) => {
        if (!string) {
          return []
        }
        try {
          return JSON.parse(string.toString())
        } catch {
          return []
        }
      })
      .then((list) => {
        setUrl(list)
      })
  }, [])

  useEffect(() => {}, [urlList])

  return (
    <List navigationTitle="总览">
      {urlList.map((url) => (
        <Section key={url} url={url} />
      ))}
    </List>
  )
}

const Section: FC<{ url: string }> = (props) => {
  const { notes, posts } = useFetchData(props.url)
  const [title, setTitle] = useState('')

  useEffect(() => {
    const client = createClient(axiosAdaptor)(props.url, {
      controllers: [AggregateController],
    })
    client.aggregate.getAggregateData().then((data) => {
      setTitle(data.seo.title)
    })
  })

  const sortedList = useMemo(() => {
    return [...notes, ...posts].sort((a, b) => {
      return +new Date(a.created) > +new Date(b.created) ? -1 : 1
    })
  }, [notes, posts])

  return (
    <ListSection title={title}>
      {sortedList.map((post) => {
        const isPost = 'category' in post
        return (
          <List.Item
            title={post.title}
            key={post.id}
            accessoryTitle={isPost ? post.category.name : '生活记录'}
            actions={
              <ActionPanel>
                <PushAction
                  title="阅读"
                  target={
                    <MarkdownRender
                      type={isPost ? 'posts' : 'notes'}
                      apiUrl={props.url}
                      id={post.id}
                    />
                  }
                ></PushAction>
              </ActionPanel>
            }
          />
        )
      })}
    </ListSection>
  )
}

render(<MixSitePostList />)
