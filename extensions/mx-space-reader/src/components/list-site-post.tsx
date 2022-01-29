import { axiosAdaptor } from '@mx-space/api-client/lib/adaptors/axios'
import {
  ActionPanel,
  ActionPanelItem,
  Icon,
  List,
  ListSection,
  showToast,
  ToastStyle,
  useNavigation,
} from '@raycast/api'
import { FC } from 'react'
import { ua } from '../constants'
import { useFetchData } from '../use-fetch-data'
import { MarkdownRender } from './markdown-render'

axiosAdaptor.default.defaults.headers.common['user-agent'] = ua

export const ListSitePost: FC<{ apiUrl: string }> = (props) => {
  const { apiUrl } = props
  const { loading, notes, posts } = useFetchData(apiUrl)
  const nav = useNavigation()
  return (
    <List navigationTitle="文章列表" isLoading={loading}>
      <ListSection title="Posts">
        {posts.map((post) => (
          <List.Item
            title={post.title}
            key={post.id}
            accessoryTitle={post.category.name}
            actions={
              <ActionPanel>
                <ActionPanelItem
                  title="阅读"
                  icon={Icon.Eye}
                  onAction={() => {
                    if (!apiUrl) {
                      showToast(ToastStyle.Failure, 'api url is not define')
                      return
                    }
                    nav.push(
                      <MarkdownRender
                        apiUrl={apiUrl}
                        id={post.id}
                        type={'posts'}
                      />,
                    )
                  }}
                ></ActionPanelItem>
              </ActionPanel>
            }
          />
        ))}
      </ListSection>

      <ListSection title="Notes">
        {notes.map((note) => (
          <List.Item
            title={note.title}
            key={note.id}
            accessoryTitle={note.nid.toString()}
            actions={
              <ActionPanel>
                <ActionPanelItem
                  title="阅读"
                  icon={Icon.Eye}
                  onAction={() => {
                    nav.push(
                      <MarkdownRender
                        apiUrl={apiUrl}
                        id={note.id}
                        type={'notes'}
                      />,
                    )
                  }}
                ></ActionPanelItem>
              </ActionPanel>
            }
          />
        ))}
      </ListSection>
    </List>
  )
}
