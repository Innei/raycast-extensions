import {
  render,
  Form,
  Detail,
  ActionPanel,
  ActionPanelItem,
  setLocalStorageItem,
  Icon,
  getLocalStorageItem,
  showToast,
  ToastStyle,
  popToRoot,
  useNavigation,
} from '@raycast/api'
import axios from 'axios'
import { FC, useState } from 'react'
import { StorageServerKey } from './constants'
import { FetchSiteDetail } from './fetch-site-detail'

export const AddMixSpaceServer: FC = () => {
  const [apiUrl, setApiUrl] = useState('')
  const [webUrl, setWebUrl] = useState(
    process.env.NODE_ENV === 'development' ? 'https://innei.ren' : '',
  )

  const save = async () => {
    let apiUrl$ = apiUrl
    if (apiUrl$ === '') {
      // fetch api url from web url head meta
      if (webUrl === '') {
        showToast(ToastStyle.Failure, 'Url is empty')
        return
      }
      const data = await axios.get(webUrl).then((res) => {
        return res.data as string
      })
      const matched = data.match(/<meta name="api_url" content="(.*?)"\/>/)
      if (matched) {
        apiUrl$ = matched[1]
        setApiUrl(apiUrl$)
      } else {
        showToast(ToastStyle.Failure, 'Can not find api url from web url')
      }
    }
    nav.push(<FetchSiteDetail apiUrl={apiUrl$} />)
  }

  const nav = useNavigation()
  return (
    <Form
      navigationTitle="添加一个新的 Mix Space 阅读源"
      actions={
        <ActionPanel>
          <ActionPanelItem
            title="获取信息"
            icon={Icon.ArrowRight}
            onAction={save}
          ></ActionPanelItem>

          <ActionPanelItem
            title="重置"
            icon={Icon.Trash}
            onAction={() => {
              setApiUrl('')
              setWebUrl('')
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        title="输入接口访问地址"
        value={apiUrl}
        onChange={setApiUrl}
        id="apiUrl"
        placeholder="API 地址"
      ></Form.TextField>

      <Form.TextField
        placeholder="https://innei.ren"
        title="主站地址"
        value={webUrl}
        onChange={setWebUrl}
        id="webUrl"
      ></Form.TextField>
    </Form>
  )
}

render(<AddMixSpaceServer />)
