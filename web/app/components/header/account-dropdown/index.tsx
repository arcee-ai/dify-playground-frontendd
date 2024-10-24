'use client'
import { useTranslation } from 'react-i18next'
import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useContext } from 'use-context-selector'
import { RiArrowDownSLine } from '@remixicon/react'
import { Menu, Transition } from '@headlessui/react'
import { Cog8ToothIcon } from '@heroicons/react/20/solid'
import AccountAbout from '../account-about'
import I18n from '@/context/i18n'
import Avatar from '@/app/components/base/avatar'
import { logout } from '@/service/common'
import { useAppContext } from '@/context/app-context'
import { LogOut01 } from '@/app/components/base/icons/src/vender/line/general'
import { useModalContext } from '@/context/modal-context'
import { useProviderContext } from '@/context/provider-context'
import { Plan } from '@/app/components/billing/type'

export type IAppSelector = {
  isMobile: boolean
}

export default function AppSelector({ isMobile }: IAppSelector) {
  const itemClassName = `
    flex items-center w-full h-9 px-3 text-gray-700 text-[14px]
    rounded-lg font-normal hover:bg-gray-50 cursor-pointer
  `
  const router = useRouter()
  const [aboutVisible, setAboutVisible] = useState(false)

  const { locale } = useContext(I18n)
  const { t } = useTranslation()
  const { userProfile, langeniusVersionInfo } = useAppContext()
  const { setShowAccountSettingModal } = useModalContext()
  const { plan } = useProviderContext()
  const canEmailSupport = plan.type === Plan.professional || plan.type === Plan.team || plan.type === Plan.enterprise

  const handleLogout = async () => {
    await logout({
      url: '/logout',
      params: {},
    })

    if (localStorage?.getItem('console_token'))
      localStorage.removeItem('console_token')

    router.push('/signin')
  }

  return (
    <div className="">
      <Menu as="div" className="relative inline-block text-left">
        {
          ({ open }) => (
            <>
              <div>
                <Menu.Button
                  className={`
                    inline-flex items-center
                    rounded-[20px] py-1 pr-2.5 pl-1 text-sm
                  text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium
                    mobile:px-1
                    ${open && 'bg-primary-50 text-primary-500 hover:bg-primary-100 hover:text-primary-700'}
                  `}
                >
                  <Avatar name={userProfile.name} className='sm:mr-2 mr-0' size={24} />
                  {!isMobile && <>
                    {userProfile.name}
                    <RiArrowDownSLine className="w-3 h-3 ml-1 text-gray-700" />
                  </>}
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  className="
                    absolute right-0 mt-1.5 w-60 max-w-80
                    p-1 divide-y divide-gray-100 origin-top-right rounded-xl bg-white border border-gray-200
                    shadow-lg
                  "
                >
                  <Menu.Item>
                    <div className='flex flex-nowrap items-center py-3 px-2'>
                      <Avatar name={userProfile.name} size={32} className='mr-3' />
                      <div className='grow'>
                        <div className='leading-5 font-medium text-sm text-gray-900 break-all'>{userProfile.name}</div>
                        <div className='leading-[18px] text-xs font-normal text-gray-500 break-all'>{userProfile.email}</div>
                      </div>
                    </div>
                  </Menu.Item>

                  <div className="px-1 py-1">

                    <Menu.Item>
                      <div className='flex items-center h-9 px-3 gap-1.5 rounded-lg cursor-pointer group hover:bg-gray-50' onClick={() => setShowAccountSettingModal({ payload: 'members' })}>
                        <Cog8ToothIcon className='w-4 h-4 text-gray-700 hover:text-black' />
                        <div className='font-medium text-sm text-gray-700 hover:text-black'>{t('common.userProfile.settings')}</div>
                      </div>
                    </Menu.Item>
                    <Menu.Item>
                      <div onClick={() => handleLogout()}>
                        <div
                          className='flex items-center h-9 px-3 gap-1.5 rounded-lg cursor-pointer group hover:bg-gray-50'
                        >
                          <LogOut01 className='w-4 h-4 text-gray-700 hover:text-black' />
                          <div className='font-medium text-sm text-gray-700 hover:text-black'>{t('common.userProfile.logout')}</div>

                        </div>
                      </div>
                    </Menu.Item>

                  </div>

                </Menu.Items>
              </Transition>
            </>
          )
        }
      </Menu>
      {
        aboutVisible && <AccountAbout onCancel={() => setAboutVisible(false)} langeniusVersionInfo={langeniusVersionInfo} />
      }
    </div >
  )
}
