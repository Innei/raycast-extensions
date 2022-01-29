import {
  PostModel,
  NoteModel,
  createClient,
  PostController,
  NoteController,
} from '@mx-space/api-client'
import { axiosAdaptor } from '@mx-space/api-client/lib/adaptors/axios'
import { showToast, ToastStyle } from '@raycast/api'
import { useState, useMemo, useEffect } from 'react'

export const useFetchData = (apiUrl: string) => {
  const [posts, setPosts] = useState<PostModel[]>([])
  const [notes, setNotes] = useState<NoteModel[]>([])
  const [loading, setLoading] = useState(true)

  const $http = useMemo(
    () =>
      createClient(axiosAdaptor)(apiUrl || '', {
        controllers: [PostController, NoteController],
      }),
    [apiUrl],
  )

  const fetchPost = () => {
    setLoading(true)
    return $http.post.getList()
  }
  const fetchNote = () => {
    setLoading(true)
    return $http.note.getList()
  }

  useEffect(() => {
    if (!apiUrl) {
      showToast(ToastStyle.Failure, '无效的 API 地址')
      return
    }

    Promise.all([
      fetchNote().then((payload) => {
        const { data } = payload
        setNotes(data)
      }),
      fetchPost().then((payload) => {
        const { data } = payload
        setPosts(data)
      }),
    ]).then(() => {
      setLoading(false)
    })
  }, [apiUrl])

  return { posts, notes, loading }
}
