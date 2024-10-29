'use client'
import { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useBoolean } from 'ahooks'
import { useRouter, useSelectedLayoutSegment } from 'next/navigation'
import HeaderBillingBtn from '../billing/header-billing-btn'
import Button from '../base/button'
import Aicon from '../base/a-icon'
import AccountDropdown from './account-dropdown'
import AppNav from './app-nav'
import DatasetNav from './dataset-nav'
import ExploreNav from './explore-nav'
import ToolsNav from './tools-nav'
import GithubStar from './github-star'
import WorkflowsNav from './workflows-nav'
import { WorkspaceProvider } from '@/context/workspace-context'
import { useAppContext } from '@/context/app-context'
import LogoSite from '@/app/components/base/logo/logo-site'
import useBreakpoints, { MediaType } from '@/hooks/use-breakpoints'
import { useProviderContext } from '@/context/provider-context'
import { useModalContext } from '@/context/modal-context'

const navClassName = `
  flex items-center relative mr-0 sm:mr-3 px-3 h-8 rounded-xl
  font-medium text-sm
  cursor-pointer
`

const Header = () => {
  const router = useRouter()
  const { isCurrentWorkspaceEditor, isCurrentWorkspaceDatasetOperator }
    = useAppContext()

  const selectedSegment = useSelectedLayoutSegment()
  const media = useBreakpoints()
  const isMobile = media === MediaType.mobile
  const [isShowNavMenu, { toggle, setFalse: hideNavMenu }] = useBoolean(false)
  const { enableBilling, plan } = useProviderContext()
  const { setShowPricingModal, setShowAccountSettingModal } = useModalContext()
  const isFreePlan = plan.type === 'sandbox'
  const handlePlanClick = useCallback(() => {
    if (isFreePlan)
      setShowPricingModal()
    else setShowAccountSettingModal({ payload: 'billing' })
  }, [isFreePlan, setShowAccountSettingModal, setShowPricingModal])

  useEffect(() => {
    hideNavMenu()
  }, [selectedSegment])
  return (
    <div className="flex flex-1 items-center justify-between px-4 py-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="large"
          onClick={() => router.back()}
          className="flex items-center btn-icon btn-rounded"
        >
          <Aicon icon="icon-left" size={24} className="a-icon--btn" />
        </Button>
        <Button
          variant="ghost"
          size="large"
          onClick={() => {
            router.push('/apps')
          }}
          className="btn-rounded btn-icon"
        >
          <span className="text-base font-bold text-black leading-6">
            Workflows
          </span>
        </Button>
        <Aicon
          color="var(--color-basic-gray-200)"
          icon="icon-arrow-right"
          size={20}
        />
        <WorkflowsNav />
      </div>
      {isMobile && (
        <div className="flex">
          <Link href="/apps" className="flex items-center mr-4">
            <LogoSite />
          </Link>
          <GithubStar />
        </div>
      )}
      {/*! isMobile && (
        <div className='flex items-center'>
          {!isCurrentWorkspaceDatasetOperator && <ExploreNav className={navClassName} />}
          {!isCurrentWorkspaceDatasetOperator && <AppNav />}
          {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && <DatasetNav />}
          {!isCurrentWorkspaceDatasetOperator && <ToolsNav className={navClassName} />}
        </div>
      ) */}
      <div className="flex items-center flex-shrink-0">
        {/* <EnvNav /> */}
        {enableBilling && (
          <div className="mr-3 select-none">
            <HeaderBillingBtn onClick={handlePlanClick} />
          </div>
        )}
        <WorkspaceProvider>
          <AccountDropdown isMobile={isMobile} />
        </WorkspaceProvider>
      </div>
      {isMobile && isShowNavMenu && (
        <div className="w-full flex flex-col p-2 gap-y-1">
          {!isCurrentWorkspaceDatasetOperator && (
            <ExploreNav className={navClassName} />
          )}
          {!isCurrentWorkspaceDatasetOperator && <AppNav />}
          {(isCurrentWorkspaceEditor || isCurrentWorkspaceDatasetOperator) && (
            <DatasetNav />
          )}
          {!isCurrentWorkspaceDatasetOperator && (
            <ToolsNav className={navClassName} />
          )}
        </div>
      )}
    </div>
  )
}
export default Header
