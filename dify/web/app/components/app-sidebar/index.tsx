import React, { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import NavLink from './navLink'
import type { NavIcon } from './navLink'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'

import { useStore as useAppStore } from '@/app/components/app/store'

export type IAppDetailNavProps = {
  iconType?: 'app' | 'dataset' | 'notion'
  title: string
  desc: string
  isExternal?: boolean
  icon: string
  icon_background: string
  navigation: Array<{
    name: string
    href: string
    icon: NavIcon
    selectedIcon: NavIcon
  }>
  extraInfo?: (modeState: string) => React.ReactNode
}

const AppDetailNav = ({
  title,
  desc,
  isExternal,
  icon,
  icon_background,
  navigation,
  extraInfo,
  iconType = 'app',
}: IAppDetailNavProps) => {
  const { appSidebarExpand, setAppSiderbarExpand } = useAppStore(
    useShallow(state => ({
      appSidebarExpand: state.appSidebarExpand,
      setAppSiderbarExpand: state.setAppSiderbarExpand,
    })),
  )
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const expand = appSidebarExpand === 'expand'

  const handleToggle = (state: string) => {
    setAppSiderbarExpand(state === 'expand' ? 'collapse' : 'expand')
  }

  useEffect(() => {
    if (appSidebarExpand) {
      localStorage.setItem('app-detail-collapse-or-expand', appSidebarExpand)
      setAppSiderbarExpand(appSidebarExpand)
    }
  }, [appSidebarExpand, setAppSiderbarExpand])

  return (
    <div
      /* className={`
        shrink-0 flex flex-col bg-background-default-subtle border-r border-divider-burn transition-all
        ${expand ? "w-[216px]" : "w-14"}
      `} */
      className="absolute top-24 left-6 p-1 rounded-full shadow-lg z-20 bg-white"
    >
      {/*
      <div
        className={`
          shrink-0
          ${expand ? 'p-3' : 'p-2'}
        `}
      >
        {iconType === 'app' && (
          <AppInfo expand={expand} />
        )}
        {iconType !== 'app' && (
          <AppBasic
            mode={appSidebarExpand}
            iconType={iconType}
            icon={icon}
            icon_background={icon_background}
            name={title}
            type={desc}
            isExternal={isExternal}
          />
        )}
      </div>
      */}
      {/*! expand && (
        <div className="mt-1 mx-auto w-6 h-[1px] bg-divider-subtle" />
      ) */}
      <nav
        className={`
          flex gap-x-2
          ${/* expand ? "p-4" : "px-2.5 py-4" */ ''}
        `}
      >
        {navigation.map((item, index) => {
          return (
            index < 2 && (
              <NavLink
                key={index}
                mode={appSidebarExpand}
                iconMap={{ selected: item.selectedIcon, normal: item.icon }}
                name={item.name}
                href={item.href}
              />
            )
          )
        })}
        {extraInfo && extraInfo(appSidebarExpand)}
      </nav>
      {/* }
      {!isMobile && (
        <div
          className={`
              shrink-0 py-3
              ${expand ? "px-6" : "px-4"}
            `}
        >

          <div
            className="flex items-center justify-center w-6 h-6 text-gray-500 cursor-pointer"
            onClick={() => handleToggle(appSidebarExpand)}
          >
            {expand ? (
              <AlignLeft01 className="w-[14px] h-[14px]" />
            ) : (
              <AlignRight01 className="w-[14px] h-[14px]" />
            )}
          </div>

        </div>

            )} */}
    </div>
  )
}

export default React.memo(AppDetailNav)
