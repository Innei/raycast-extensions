import { createClient } from '@mx-space/api-client'
import { axiosAdaptor } from '@mx-space/api-client/lib/adaptors/axios'
import {
  ActionPanel,
  CopyToClipboardAction,
  Detail,
  OpenInBrowserAction,
  showToast,
  ToastStyle,
} from '@raycast/api'
import { FC, useEffect, useState } from 'react'
import { ua } from '../constants'

axiosAdaptor.default.defaults.headers.common['user-agent'] = ua

export const MarkdownRender: FC<{
  id: string
  apiUrl: string
  type: 'posts' | 'notes'
}> = ({ type, apiUrl, id }) => {
  const [loading, setLoading] = useState(true)
  const [markdown, setMarkdown] = useState('')
  const [detail, setDetail] = useState({} as any)
  useEffect(() => {
    setLoading(true)
    const client = createClient(axiosAdaptor)(apiUrl, { controllers: [] })
    client.proxy[type](id)
      .get()
      .then((_data: any) => {
        const data = _data.data ?? _data
        setMarkdown(data.text)
        setDetail(data)
        setLoading(false)
      })
      .catch((err) => {
        showToast(ToastStyle.Failure, err.message)
      })
  }, [id, apiUrl])

  const siteUrl = apiUrl.replace(/\/$/, '') + '/markdown/render/' + id
  return (
    <Detail
      isLoading={loading}
      navigationTitle={loading ? 'Loading..' : '文章 - ' + detail.title || ''}
      markdown={markdown}
      actions={
        <ActionPanel>
          <OpenInBrowserAction title="阅读" url={siteUrl} />

          <CopyToClipboardAction title="复制链接" content={siteUrl} />
        </ActionPanel>
      }
    ></Detail>
  )
}
