import { AggregateRoot } from '@mx-space/api-client'
import {
  ActionPanel,
  ActionPanelItem,
  Detail,
  getLocalStorageItem,
  Icon,
  setLocalStorageItem,
  showToast,
  ToastStyle,
} from '@raycast/api'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'
import { StorageServerKey, ua } from './constants'

export const FetchSiteDetail: FC<{ apiUrl: string }> = (props) => {
  const [loading, setLoading] = useState(true)
  const [markdown, setMarkdown] = useState('')
  useEffect(() => {
    const $http = axios.create({
      baseURL: props.apiUrl,
      headers: {
        'user-agent': ua,
      },
    })

    $http
      .get('/aggregate')
      .then((data) => data.data)
      .then((data: AggregateRoot) => {
        const { seo, user } = data
        setMarkdown(
          [
            `# 站点`,
            `**标题**: ${seo.title}`,
            `**简介**: ${seo.description}`,
            `**关键字**: ${seo.keywords?.join(', ') || ''}`,
            `# 站长`,
            `**昵称**: ${user.name}`,
            `**邮箱**: ${user.mail}`,
            `**介绍**: ${user.introduce}`,
          ].join('\n\n'),
        )
        setLoading(false)
      })
  }, [props.apiUrl])
  return (
    <Detail
      isLoading={loading}
      navigationTitle={'站点简介'}
      markdown={markdown}
      actions={
        <ActionPanel>
          <ActionPanelItem
            title={'添加到站点列表'}
            icon={Icon.Eye}
            onAction={async () => {
              const list: string[] = await (async () => {
                const json = await getLocalStorageItem(StorageServerKey)

                if (json) {
                  try {
                    return JSON.parse(json.toString()) as string[]
                  } catch {
                    return []
                  }
                }

                return []
              })()

              if (list.includes(props.apiUrl)) {
                showToast(ToastStyle.Failure, '已经在站点列表中了')
                return
              }

              await setLocalStorageItem(
                StorageServerKey,
                JSON.stringify([...list, props.apiUrl]),
              )
            }}
          ></ActionPanelItem>
        </ActionPanel>
      }
    ></Detail>
  )
}
