import type { FC } from 'react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounceFn, useMount } from 'ahooks'
import Aicon from '../a-icon'
import { useStore as useTagStore } from './store'
import cn from '@/utils/classnames'
import {
  PortalToFollowElem,
  PortalToFollowElemContent,
  PortalToFollowElemTrigger,
} from '@/app/components/base/portal-to-follow-elem'
import Input from '@/app/components/base/input'
import {
  Tag03,
} from '@/app/components/base/icons/src/vender/line/financeAndECommerce'
import { Check } from '@/app/components/base/icons/src/vender/line/general'
import type { Tag } from '@/app/components/base/tag-management/constant'

import { fetchTagList } from '@/service/tag'

type TagFilterProps = {
  type: 'knowledge' | 'app'
  value: string[]
  onChange: (v: string[]) => void
}
const TagFilter: FC<TagFilterProps> = ({ type, value, onChange }) => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const tagList = useTagStore(s => s.tagList)
  const setTagList = useTagStore(s => s.setTagList)

  const [keywords, setKeywords] = useState('')
  const [searchKeywords, setSearchKeywords] = useState('')
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

  const filteredTagList = useMemo(() => {
    return tagList.filter(
      tag => tag.type === type && tag.name.includes(searchKeywords),
    )
  }, [type, tagList, searchKeywords])

  const currentTag = useMemo(() => {
    return tagList.find(tag => tag.id === value[0])
  }, [value, tagList])

  const selectTag = (tag: Tag) => {
    if (value.includes(tag.id))
      onChange(value.filter(v => v !== tag.id))
    else onChange([...value, tag.id])
  }

  useMount(() => {
    fetchTagList(type).then((res) => {
      setTagList(res)
    })
  })

  return (
    <PortalToFollowElem
      open={open}
      onOpenChange={setOpen}
      placement="bottom-start"
      offset={4}
    >
      <div className="relative">
        <PortalToFollowElemTrigger
          onClick={() => setOpen(v => !v)}
          className="block"
        >
          <div
            className={cn(
              'btn btn-medium btn-icon btn-ghost',
              open
                && !value.length
                && '!bg-[var(--color-components-button-ghost-bg-hover)]',
              !open && !!value.length && 'btn-ghost-accent',
              open
                && !!value.length
                && 'btn-ghost-accent !bg-[var(--color-components-button-ghost-accent-bg-hover)]',
            )}
          >
            <Aicon icon="icon-tag" className="a-icon--btn" />
            <div>
              {!value.length && t('common.tag.placeholder')}
              {!!value.length && currentTag?.name}
            </div>
            {value.length > 1 && <div>{`+${value.length - 1}`}</div>}
            {!value.length && (
              <Aicon
                icon="icon-down"
                className={cn(
                  'a-icon--btn transition-transform duration-300',
                  open && 'rotate-180',
                )}
              />
            )}
            {!!value.length && (
              <div
                className="p-[1px] cursor-pointer group/clear"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange([])
                }}
              >
                <Aicon
                  icon="icon-cancel"
                  color="var(--color-basic-gray-500)"
                  className="a-icon--btn transition-transform duration-300 hover:rotate-180"
                  size={16}
                />
              </div>
            )}
          </div>
        </PortalToFollowElemTrigger>
        <PortalToFollowElemContent className="z-[1002]">
          <div className="fade-up-8 relative w-[280px] bg-white card-xs rounded-xl">
            <div>
              <Input
                showLeftIcon
                showClearIcon
                value={keywords}
                onChange={e => handleKeywordsChange(e.target.value)}
                onClear={() => handleKeywordsChange('')}
              />
            </div>
            <div className="max-h-72 overflow-auto flex flex-col gap-y-1 pt-2">
              {filteredTagList.map(tag => (
                <div
                  key={tag.id}
                  className="flex items-center gap-3 pl-3 py-[6px] pr-2 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => selectTag(tag)}
                >
                  <div
                    title={tag.name}
                    className="grow text-sm text-gray-700 leading-5 truncate"
                  >
                    {tag.name}
                  </div>
                  {value.includes(tag.id) && (
                    <Check className="shrink-0 w-4 h-4 text-primary-600" />
                  )}
                </div>
              ))}
              {!filteredTagList.length && (
                <div className="p-3 flex flex-col items-center gap-1">
                  <Tag03 className="h-6 w-6 text-gray-300" />
                  <div className="text-gray-500 text-xs leading-[14px]">
                    {t('common.tag.noTag')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </PortalToFollowElemContent>
      </div>
    </PortalToFollowElem>
  )
}

export default TagFilter
