'use client'

import { useRouter } from 'next/navigation'
import Button from '../../base/button'
import type { NavItem } from '../nav/nav-selector'
import AppIcon from '@/app/components/base/app-icon'

export type HeaderAppItemProps = {
  app: NavItem
}

const HeaderAppItem = ({ app }: HeaderAppItemProps) => {
  const { push } = useRouter()

  return (
    <>
      <Button
        onClick={(e) => {
          e.preventDefault()

          push(app.link)
        }}
        variant="ghost"
        size="medium"
        className="btn-icon-left btn-rounded justify-start w-full"
      >
        <AppIcon
          size="small"
          iconType={app.icon_type}
          icon={app.icon}
          background={app.icon_background}
          imageUrl={app.icon_url}
          className="w-5 h-5"
        />

        <span className="text-sm leading-4 overflow-ellipsis w-ful font-normal text-black">
          {app.name}
        </span>
      </Button>
    </>
  )
}

export default HeaderAppItem
