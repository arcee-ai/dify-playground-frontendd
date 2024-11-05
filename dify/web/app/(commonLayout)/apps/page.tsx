import Apps from './Apps'
import { getLocaleOnServer, useTranslation as translate } from '@/i18n/server'

const AppList = async () => {
  const locale = getLocaleOnServer()
  const { t } = await translate(locale, 'app')

  return (
    <div className='relative flex flex-col overflow-y-auto bg-white shrink-0 h-0 grow'>
      <Apps />

    </div >
  )
}

export default AppList
