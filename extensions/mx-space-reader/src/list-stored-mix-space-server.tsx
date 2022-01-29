import { AggregateRoot, camelcaseKeys } from '@mx-space/api-client'
import {
  ActionPanel,
  ActionPanelItem,
  getLocalStorageItem,
  Icon,
  List,
  PushAction,
  render,
  setLocalStorageItem,
  showToast,
  ToastStyle,
} from '@raycast/api'
import axios from 'axios'
import { FC, useEffect, useState } from 'react'
import { ListSitePost } from './components/list-site-post'
import { StorageServerKey, ua } from './constants'

export const ListStoredServer: FC = () => {
  const [loading, seLoading] = useState(true)
  const [list, setList] = useState<string[]>([])

  const [details, setDetails] = useState({} as Record<string, AggregateRoot>)
  useEffect(() => {
    getLocalStorageItem(StorageServerKey)
      .then((data) => {
        const list: string[] = JSON.parse(String(data) || '[]')
        setList(list)
        return list
      })
      .then(async (list) => {
        await Promise.all(
          list.map(async (url) => {
            const detail = await fetchAggregate(url)
            setDetails((details) => ({ ...details, [url]: detail }))
          }),
        )
        seLoading(false)
      })
  }, [])

  const fetchAggregate = async (url: string) => {
    if (!url) {
      return
    }

    const $http = axios.create({
      baseURL: url,
      headers: {
        'user-agent': ua,
      },
    })

    return $http
      .get('/aggregate')
      .then((data) => data.data)
      .then((data) => camelcaseKeys(data, { deep: true }))
      .catch((err) => {
        showToast(ToastStyle.Failure, '获取站点信息失败, URL: ' + url)
      })
  }

  return (
    <List isLoading={loading}>
      {list.map((url) => (
        <List.Item
          accessoryTitle={details[url]?.url.webUrl ?? url}
          title={details[url]?.seo.title || ''}
          key={url}
          actions={
            <ActionPanel>
              <PushAction
                target={<ListSitePost apiUrl={url} />}
                title="阅读"
                icon={Icon.Eye}
              ></PushAction>
              <ActionPanelItem
                title="删除"
                icon={Icon.Trash}
                onAction={async () => {
                  await getLocalStorageItem(StorageServerKey).then((data) => {
                    if (!data) {
                      return
                    }
                    const list = JSON.parse(data.toString() || '[]') as string[]
                    list.splice(list.indexOf(url), 1)
                    setList([...list])
                    return setLocalStorageItem(
                      StorageServerKey,
                      JSON.stringify(list),
                    )
                  })
                }}
              ></ActionPanelItem>
            </ActionPanel>
          }
        ></List.Item>
      ))}
    </List>
  )
}

render(<ListStoredServer />)
