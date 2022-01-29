import {
  ActionPanel,
  ActionPanelItem,
  CopyToClipboardAction,
  Icon,
  List,
  ListItem,
  useNavigation,
} from '@raycast/api'
import http from 'http'
import os from 'os'
import { FC, useEffect, useMemo, useState } from 'react'
const networkInterfaces = os.networkInterfaces()

const networkEntires = Object.entries(networkInterfaces).filter(
  ([k]) => !k.startsWith('lo'),
)

const list = networkEntires
  .map(([k, v]) => {
    return {
      interface$: k,
      addresses: v?.flat().map(({ address }) => address),
      isV4: v?.flat().some(({ family }) => family === 'IPv4'),
      mac: Array.from(
        v
          ?.flat()
          .reduce((acc, { mac }) => acc.add(mac), new Set())
          .values() || [],
      ).join(', '),
    }
  })
  .filter((i) => i.mac !== '00:00:00:00:00:00')
  .sort((a) => (a.interface$ === 'en0' ? -1 : a.isV4 ? -1 : 1))

export type IpInfo = {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  timezone: string
}
export default function main() {
  const [publicIp, setPublicIp] = useState<string | undefined>(undefined)
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    fetchIp()
  }, [])

  function fetchIp() {
    setError(false)
    http.get(
      {
        host: 'ipinfo.io',
        port: 80,
        path: '/',
        headers: { 'user-agent': 'curl' },
      },
      function (resp) {
        resp.on('data', function (ip: Buffer) {
          const data = JSON.parse(ip.toString('utf-8'))
          setPublicIp(data.ip)
          delete data.readme
          setIpInfo(data)
        })

        resp.on('error', () => {
          setError(true)
        })
      },
    )
  }
  const nav = useNavigation()

  const Detail = useMemo(
    () => (
      <>
        <List>
          {Object.entries(ipInfo || {}).map(([k, v]) => (
            <ListItem
              key={k}
              title={v}
              accessoryTitle={k.charAt(0).toUpperCase() + k.slice(1)}
              actions={
                <ActionPanel>
                  <CopyToClipboardAction content={v} />
                </ActionPanel>
              }
            ></ListItem>
          ))}
        </List>
      </>
    ),
    [ipInfo],
  )
  return (
    <List isLoading={!publicIp}>
      <List.Item
        icon={Icon.Globe}
        title={
          error ? 'Fetch Error, Retry Press Enter.' : publicIp || 'Fetching..'
        }
        accessoryTitle={'Public IP'}
        actions={
          publicIp ? (
            <ActionPanel>
              <CopyToClipboardAction content={publicIp} />
              <ActionPanelItem
                shortcut={{ key: 'tab', modifiers: [] }}
                title="Detail"
                onAction={() => {
                  nav.push(Detail)
                }}
              ></ActionPanelItem>
            </ActionPanel>
          ) : error ? (
            <ActionPanel>
              <ActionPanelItem
                title="Retry"
                onAction={fetchIp}
              ></ActionPanelItem>
            </ActionPanel>
          ) : null
        }
      />
      {list.map(({ interface$, addresses, mac }, idx) => {
        if (!addresses) {
          return null
        }
        if (addresses.length > 1) {
          return addresses.map((add) => {
            return !add ? null : (
              <IpItem
                key={add}
                mac={mac || ''}
                interface$={interface$}
                address={add}
              ></IpItem>
            )
          })
        } else if (addresses[0]) {
          return (
            <IpItem
              key={idx}
              mac={mac || ''}
              interface$={interface$}
              address={addresses[0]}
            ></IpItem>
          )
        } else return null
      })}
    </List>
  )
}

export const IpItem: FC<{
  mac?: string
  address?: string
  interface$: string
}> = (props) => {
  const { mac, interface$, address } = props
  return (
    <List.Item
      icon={Icon.Circle}
      subtitle={mac || ''}
      actions={
        <ActionPanel>
          <CopyToClipboardAction content={address || ''} />
          <CopyToClipboardAction title="Copy Mac Address" content={mac || ''} />
        </ActionPanel>
      }
      key={interface$}
      title={address || ''}
      accessoryTitle={interface$}
    ></List.Item>
  )
}
