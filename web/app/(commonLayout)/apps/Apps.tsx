'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWRInfinite from 'swr/infinite'
import { useTranslation } from 'react-i18next'
import { useDebounceFn } from 'ahooks'
import {
  RiApps2Line,
  RiExchange2Line,
  RiMessage3Line,
  RiRobot3Line,
} from '@remixicon/react'
import AppCard from './AppCard'
import useAppsQueryState from './hooks/useAppsQueryState'
import type { AppListResponse } from '@/models/app'
import { fetchAppList } from '@/service/apps'
import { useAppContext } from '@/context/app-context'
import { NEED_REFRESH_APP_LIST_KEY } from '@/config'
import { CheckModal } from '@/hooks/use-pay'
import { useTabSearchParams } from '@/hooks/use-tab-searchparams'
import Input from '@/app/components/base/input'
import { useStore as useTagStore } from '@/app/components/base/tag-management/store'
import TagManagementModal from '@/app/components/base/tag-management'
import TagFilter from '@/app/components/base/tag-management/filter'
import Button from '@/app/components/base/button'
import Aicon from '@/app/components/base/a-icon'
import CreateAppModal from '@/app/components/app/create-app-modal'
import CreateAppTemplateDialog from '@/app/components/app/create-app-dialog'

const getKey = (
  pageIndex: number,
  previousPageData: AppListResponse,
  activeTab: string,
  tags: string[],
  keywords: string,
) => {
  if (!pageIndex || previousPageData.has_more) {
    const params: any = {
      url: 'apps',
      params: {
        page: pageIndex + 1,
        limit: 30,
        name: keywords,
        mode: 'workflow',
      },
    }

    if (tags.length)
      params.params.tag_ids = tags

    return params
  }
  return null
}

const Apps = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator }
    = useAppContext()
  const showTagManagementModal = useTagStore(s => s.showTagManagementModal)
  const [activeTab, setActiveTab] = useTabSearchParams({
    defaultTab: 'all',
  })
  const {
    query: { tagIDs = [], keywords = '' },
    setQuery,
  } = useAppsQueryState()
  const [tagFilterValue, setTagFilterValue] = useState<string[]>(tagIDs)
  const [searchKeywords, setSearchKeywords] = useState(keywords)
  const [showDropdown, setShowDropdown] = useState(false) // Stan do zarządzania widocznością dropdowna
  const [showNewAppModal, setShowNewAppModal] = useState(false)
  const [showNewAppTemplateDialog, setShowNewAppTemplateDialog]
    = useState(false)

  const setKeywords = useCallback(
    (keywords: string) => {
      setQuery(prev => ({ ...prev, keywords }))
    },
    [setQuery],
  )
  const setTagIDs = useCallback(
    (tagIDs: string[]) => {
      setQuery(prev => ({ ...prev, tagIDs }))
    },
    [setQuery],
  )

  const { data, isLoading, setSize, mutate } = useSWRInfinite(
    (pageIndex: number, previousPageData: AppListResponse) =>
      getKey(pageIndex, previousPageData, activeTab, tagIDs, searchKeywords),
    fetchAppList,
    { revalidateFirstPage: true },
  )

  const anchorRef = useRef<HTMLDivElement>(null)
  const options = [
    {
      value: 'all',
      text: t('app.types.all'),
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: 'chat',
      text: t('app.types.chatbot'),
      icon: <RiMessage3Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: 'agent-chat',
      text: t('app.types.agent'),
      icon: <RiRobot3Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: 'workflow',
      text: t('app.types.workflow'),
      icon: <RiExchange2Line className="w-[14px] h-[14px] mr-1" />,
    },
  ]

  useEffect(() => {
    document.title = `${t('common.menus.apps')} -  Dify`
    if (localStorage.getItem(NEED_REFRESH_APP_LIST_KEY) === '1') {
      localStorage.removeItem(NEED_REFRESH_APP_LIST_KEY)
      mutate()
    }
  }, [mutate, t])

  useEffect(() => {
    if (isCurrentWorkspaceDatasetOperator)
      return router.replace('/datasets')
  }, [router, isCurrentWorkspaceDatasetOperator])

  useEffect(() => {
    const hasMore = data?.at(-1)?.has_more ?? true
    let observer: IntersectionObserver | undefined
    if (anchorRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isLoading && hasMore)
            setSize((size: number) => size + 1)
        },
        { rootMargin: '100px' },
      )
      observer.observe(anchorRef.current)
    }
    return () => observer?.disconnect()
  }, [isLoading, setSize, anchorRef, mutate, data])

  const { run: handleSearch } = useDebounceFn(
    () => {
      setSearchKeywords(keywords)
    },
    { wait: 500 },
  )
  const handleKeywordsChange = (value: string) => {
    setKeywords(value)
    handleSearch()
  }

  const { run: handleTagsUpdate } = useDebounceFn(
    () => {
      setTagIDs(tagFilterValue)
    },
    { wait: 500 },
  )
  const handleTagsChange = (value: string[]) => {
    setTagFilterValue(value)
    handleTagsUpdate()
  }

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current
        && !dropdownRef.current.contains(event.target as Node)
      )
        setShowDropdown(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <>
      <div className="sticky top-0 flex justify-between items-center pt-6 px-16  bg-white z-10 flex-wrap gap-y-2">
        <div className="flex items-center gap-3 relative">
          <div ref={dropdownRef}>
            <Button
              variant="primary"
              size="large"
              className="btn-icon-left"
              onClick={() => {
                setShowDropdown(!showDropdown)
              }} // Przełącz widoczność dropdowna
            >
              <Aicon
                icon="icon-add"
                className={`a-icon--btn transition-transform duration-300 ease-out ${
                  showDropdown ? 'rotate-45' : ''
                }`}
              />
              <span>Add new</span>
            </Button>

            {showDropdown && (
              <div className="absolute top-14 left-0 card-m z-20 flex flex-col gap-1 fade-up-8">
                <Button
                  size="medium"
                  variant="ghost"
                  onClick={() => {
                    setShowNewAppModal(true)
                    setShowDropdown(false) // Zamknij dropdown po kliknięciu
                  }}
                  className="btn-icon-left btn-rounded justify-start"
                >
                  <Aicon
                    size={20}
                    className="a-icon--btn"
                    icon="icon-copy-line"
                  />
                  <span>{t('app.newApp.startFromBlank')}</span>
                </Button>
                <Button
                  size="medium"
                  variant="ghost"
                  onClick={() => {
                    setShowNewAppTemplateDialog(true)
                    setShowDropdown(false) // Zamknij dropdown po kliknięciu
                  }}
                  className="btn-icon-left btn-rounded mt-2 justify-start"
                >
                  <Aicon
                    size={20}
                    className="a-icon--btn"
                    icon="icon-copy-fill"
                  />
                  <span>{t('app.newApp.startFromTemplate')}</span>
                </Button>
              </div>
            )}
          </div>
          <Input
            showLeftIcon
            showClearIcon
            wrapperClassName="w-[400px] rounded-full"
            className="rounded-full"
            value={keywords}
            size="large"
            onChange={e => handleKeywordsChange(e.target.value)}
            onClear={() => handleKeywordsChange('')}
          />
          <TagFilter
            type="app"
            value={tagFilterValue}
            onChange={handleTagsChange}
          />
        </div>
      </div>
      <nav className="grid content-start grid-cols-1 gap-4 px-16 pt-12 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4 grow shrink-0">
        {data?.map(({ data: apps }) =>
          apps.map(app => (
            <AppCard key={app.id} app={app} onRefresh={mutate} />
          )),
        )}
        <CheckModal />
      </nav>
      <div ref={anchorRef} className="h-0">
        {' '}
      </div>
      {showTagManagementModal && (
        <TagManagementModal type="app" show={showTagManagementModal} />
      )}

      {/* Modale do tworzenia nowych aplikacji */}
      <CreateAppModal
        show={showNewAppModal}
        onClose={() => setShowNewAppModal(false)}
        onSuccess={() => {
          setShowNewAppModal(false)
        }}
      />
      <CreateAppTemplateDialog
        show={showNewAppTemplateDialog}
        onClose={() => setShowNewAppTemplateDialog(false)}
        onSuccess={() => {
          setShowNewAppTemplateDialog(false)
        }}
      />
    </>
  )
}

export default Apps
