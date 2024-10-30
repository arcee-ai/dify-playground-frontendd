'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import produce from 'immer'
import useSWRInfinite from 'swr/infinite'
import { flatten } from 'lodash-es'
import type { NavItem } from '../nav/nav-selector'
import AppIcon from '../../base/app-icon'
import Button from '../../base/button'
import Aicon from '../../base/a-icon'
import Divider from '../../base/divider'
import HeaderAppItem from './header-app-item'
import { useAppContext } from '@/context/app-context'
import { fetchAppList } from '@/service/apps'
import type { AppListResponse } from '@/models/app'
import { useStore as useAppStore } from '@/app/components/app/store'

const getKey = (
  pageIndex: number,
  previousPageData: AppListResponse,
  activeTab: string,
  keywords: string,
) => {
  if (!pageIndex || previousPageData.has_more) {
    const params: any = {
      url: 'apps',
      params: {
        page: pageIndex + 1,
        limit: 6,
        name: keywords,
        mode: 'workflow',
      },
    }

    return params
  }
  return null
}
const WorkflowsNav = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('All')
  const currentPath = usePathname()
  const [navItems, setNavItems] = useState<NavItem[]>([])
  const appDetail = useAppStore(state => state.appDetail)
  const { isCurrentWorkspaceEditor } = useAppContext()
  const { data: appsData } = useSWRInfinite(
    (pageIndex: number, previousPageData: AppListResponse) =>
      getKey(pageIndex, previousPageData, 'all', ''),
    fetchAppList,
    { revalidateFirstPage: false },
  )
  const isSingleApp = content === 'Single app' && appDetail

  // Ref do kliknięcia poza elementem
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Ustawianie content na podstawie URL
    if (currentPath === '/apps')
      setContent('All')
    else if (currentPath.startsWith('/app/') && appDetail)
      setContent('Single app')
    else setContent('Other')
  }, [currentPath, appDetail])

  const toggleOpen = () => {
    setIsOpen(!isOpen)
  }

  // Obsługa kliknięcia poza elementem
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Zamknięcie menu po zmianie URL
  useEffect(() => {
    setIsOpen(false)
  }, [currentPath])

  useEffect(() => {
    if (appsData) {
      const appItems = flatten(appsData?.map(appData => appData.data))
      const navItems = appItems.map((app) => {
        const link = ((isCurrentWorkspaceEditor, app) => {
          return `/app/${app.id}/workflow`
        })(isCurrentWorkspaceEditor, app)
        return {
          id: app.id,
          icon_type: app.icon_type,
          icon: app.icon,
          icon_background: app.icon_background,
          icon_url: app.icon_url,
          name: app.name,
          mode: app.mode,
          link,
        }
      })
      setNavItems(navItems)
    }
  }, [appsData, isCurrentWorkspaceEditor, setNavItems])

  useEffect(() => {
    if (appDetail) {
      const newNavItems = produce(navItems, (draft: NavItem[]) => {
        navItems.forEach((app, index) => {
          if (app.id === appDetail.id)
            draft[index].name = appDetail.name
        })
      })
      setNavItems(newNavItems)
    }
  }, [appDetail, navItems])

  return (
    <div className="relative" ref={menuRef}>
      <Button
        onClick={toggleOpen}
        variant="ghost"
        size="large"
        className={`btn-icon btn-rounded${isOpen ? ' workflow-nav--open' : ''}`}
      >
        <div className="text-base leading-5 overflow-ellipsis w-full font-normal text-black">
          <div className="flex items-center gap-2">
            {content === 'All' ? (
              <span>{content}</span>
            ) : isSingleApp ? (
              <>
                <AppIcon
                  size="small"
                  iconType={appDetail.icon_type}
                  icon={appDetail.icon}
                  background={appDetail.icon_background}
                  imageUrl={appDetail.icon_url}
                />
                <span className="text-base leading-5 overflow-ellipsis w-full font-normal text-black">
                  {appDetail.name}
                </span>
              </>
            ) : (
              <span>{content}</span>
            )}
            <Aicon
              className={`a-icon--btn min-w-[20px] transition-transform duration-300 ease-out ${
                isOpen ? 'rotate-180' : ''
              }`}
              size={20}
              icon="icon-down"
            />
          </div>
        </div>
      </Button>
      {isOpen && (
        <div className="fade-up-8 border flex flex-col items-start gap-3 max-w-[340px] w-[340px] border-gray-200 rounded-lg px-3 shadow-lg pt-3 pb-4 bg-white absolute top-13 left-0">
          {navItems.map(appItem => (
            <HeaderAppItem key={appItem.id} app={appItem} />
          ))}

          <div className="flex flex-col gap-1 w-full">
            <Divider />
            <Button
              variant="ghost"
              size="medium"
              className="btn-icon-left btn-rounded w-full justify-start text-left"
              onClick={() => {
                router.push('/apps')
              }}
            >
              <Aicon icon="icon-grid" size={20} className="a-icon--btn" />
              <span>Manage All</span>
            </Button>
            {/* <Divider />
            <Button
              variant="ghost"
              size="medium"
              onClick={() => {}}
              className="btn-icon btn-rounded w-full justify-start text-left"
            >
              <Aicon icon="icon-add" size={20} className="a-icon--btn" />
              <div className="w-full">Add new</div>
              <Aicon icon="icon-right" size={20} className="a-icon--btn" />
          </Button> */}
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowsNav
