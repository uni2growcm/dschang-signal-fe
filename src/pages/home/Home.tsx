import { Backdrop, CircularProgress, Grow } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router'
import { useMe } from '../../services/user'
import PaginationControls from '../../components/pagination/PaginationControls'
import ReportCard from '../../components/report/ReportCard'
import SnackBar from '../../components/snackBar/SnackBar'
import { PATHS } from '../../routes/PATHS'
import {
  useAuthenticatedUserReports,
  useCategories,
  usePublicReports,
  useAllReports,
} from '../../services/report'
import { isAuth } from '../../utils/utils'
import { IoMdClose } from 'react-icons/io'

type FilterType = 'public' | 'mine'
type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
type ModerationStatus = 'PENDING_REVIEW' | 'ACCEPTED' | 'REJECTED'
type CategoryOption = {
  id: number
  name: string
}
type HomeLocationState = {
  filter?: FilterType
}

const REPORT_STATUSES: ReportStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED']
const MODERATION_STATUSES: ModerationStatus[] = [
  'PENDING_REVIEW',
  'ACCEPTED',
  'REJECTED',
]
const PAGE_SIZE = 10

const formatStatus = (status: ReportStatus) =>
  status
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')

const formatModerationStatus = (status: ModerationStatus) =>
  status
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')

const getCategoryTranslationKey = (categoryName: string) => {
  const normalized = categoryName
    .trim()
    .replaceAll(/[_-]+/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .toLowerCase()

  const words = normalized.split(' ')

  return words
    .map((word, index) =>
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join('')
}

export default function Home() {
  const { t } = useTranslation()
  const location = useLocation() as { state?: HomeLocationState }
  const [page, setPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedModerationStatus, setSelectedModerationStatus] = useState('')
  const [filter, setFilter] = useState<FilterType>(
    location.state?.filter || 'public',
  )
  const [authenticated, setAuthenticated] = useState<boolean>(isAuth())
  const [showError, setShowError] = useState(false)
  const { data: currentUser } = useMe()
  const isAdmin = currentUser?.role === 'ADMIN'

  const { data: categories = [] } = useCategories({ enabled: isAdmin })
  const {
    data: myReportsData,
    isLoading: privateLoading,
    isError: privateError,
  } = useAuthenticatedUserReports(page, PAGE_SIZE)
  const {
    data: publicReportsData,
    isLoading: publicLoading,
    isError: publicError,
  } = usePublicReports({ page, size: PAGE_SIZE })

  const {
    data: allReportsData,
    isLoading: allReportsLoading,
    isError: allReportsError,
  } = useAllReports(page)

  useEffect(() => {
    const handleStorageChange = () => {
      setAuthenticated(isAuth())
    }

    globalThis.addEventListener('storage', handleStorageChange)
    return () => globalThis.removeEventListener('storage', handleStorageChange)
  }, [])

  const sourceReports = useMemo(() => {
    if (isAdmin) return allReportsData?.reports ?? []
    if (!authenticated) {
      return publicReportsData?.reports ?? []
    }

    return filter === 'mine'
      ? (myReportsData?.reports ?? [])
      : (publicReportsData?.reports ?? [])
  }, [
    authenticated,
    filter,
    myReportsData,
    publicReportsData,
    allReportsData,
    isAdmin,
  ])

  const availableCategories = useMemo<CategoryOption[]>(() => {
    if (isAdmin) {
      return categories as CategoryOption[]
    }

    const categoryMap = new Map<string, CategoryOption>()

    sourceReports.forEach((report) => {
      report.categories?.forEach((category) => {
        if (typeof category.id === 'number' && category.name) {
          categoryMap.set(category.name, {
            id: category.id,
            name: category.name,
          })
        }
      })
    })

    return Array.from(categoryMap.values()).sort((first, second) =>
      first.name.localeCompare(second.name),
    )
  }, [categories, isAdmin, sourceReports])

  const displayedReports = useMemo(() => {
    return sourceReports.filter((report) => {
      const matchesCategory =
        selectedCategory === '' ||
        report.categories?.some(
          (category) => category.name === selectedCategory,
        )
      const matchesStatus =
        selectedStatus === '' || report.reportStatus === selectedStatus
      const matchesModerationStatus =
        selectedModerationStatus === '' ||
        report.moderationStatus === selectedModerationStatus

      return matchesCategory && matchesStatus && matchesModerationStatus
    })
  }, [
    selectedCategory,
    selectedModerationStatus,
    selectedStatus,
    sourceReports,
  ])

  const totalPages = useMemo(() => {
    if (isAdmin) return allReportsData?.totalPages ?? 1
    if (!authenticated) {
      return publicReportsData?.totalPages ?? 1
    }

    return filter === 'mine'
      ? (myReportsData?.totalPages ?? 1)
      : (publicReportsData?.totalPages ?? 1)
  }, [
    authenticated,
    filter,
    myReportsData,
    publicReportsData,
    allReportsData,
    isAdmin,
  ])

  const isLoading = isAdmin
    ? allReportsLoading
    : authenticated
      ? filter === 'mine'
        ? privateLoading
        : publicLoading
      : publicLoading

  const hasError = isAdmin
    ? allReportsError
    : authenticated
      ? filter === 'mine'
        ? privateError
        : publicError
      : publicError

  const hasActiveFilters =
    selectedCategory !== '' ||
    selectedStatus !== '' ||
    selectedModerationStatus !== ''

  useEffect(() => {
    if (!hasError) return
    const timer = setTimeout(() => {
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    }, 0)
    return () => clearTimeout(timer)
  }, [hasError])

  if (
    selectedCategory !== '' &&
    !availableCategories.some((category) => category.name === selectedCategory)
  ) {
    setSelectedCategory('')
  }

  const handleFilterChange = (nextFilter: FilterType) => {
    setFilter(nextFilter)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSelectedCategory('')
    setSelectedStatus('')
    setSelectedModerationStatus('')
  }

  const getTranslatedCategoryLabel = (categoryName: string) =>
    t(`categories.${getCategoryTranslationKey(categoryName)}`, {
      defaultValue: categoryName,
    })

  const getTranslatedStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'PENDING':
        return t('home.statusPending')
      case 'IN_PROGRESS':
        return t('home.statusInProgress')
      case 'RESOLVED':
        return t('home.statusResolved')
      default:
        return formatStatus(status)
    }
  }

  const getTranslatedModerationStatusLabel = (status: ModerationStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return t('home.moderationPendingReview')
      case 'ACCEPTED':
        return t('home.moderationAccepted')
      case 'REJECTED':
        return t('home.moderationRejected')
      default:
        return formatModerationStatus(status)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-start bg-gray-50'>
        <Backdrop
          open={true}
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        >
          <div className='flex flex-col items-center gap-4'>
            <CircularProgress color='inherit' />
            <p className='text-white'>{t('home.loadingReports')}</p>
          </div>
        </Backdrop>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col items-center justify-start bg-gray-50'>
      <SnackBar
        open={showError}
        severity='error'
        message={t('home.errorLoading')}
        onClose={() => setShowError(false)}
      />

      <Grow in timeout={1000}>
        <div className='container my-10 flex flex-col gap-5 max-lg:px-5'>
          {isAdmin ? (
            <div className='flex justify-end'>
              <Link
                to={PATHS.CREATE_REPORT}
                className='rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-all hover:opacity-90'
              >
                {t('home.createReport')}
              </Link>
            </div>
          ) : (
            authenticated && (
              <div className='flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch'>
                <div className='flex gap-2 rounded-full border border-gray-200 bg-white p-1 shadow-sm w-fit'>
                  <button
                    type='button'
                    onClick={() => handleFilterChange('public')}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                      filter === 'public'
                        ? 'bg-primary text-white shadow'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {t('home.filterPublic')}
                  </button>
                  <button
                    type='button'
                    onClick={() => handleFilterChange('mine')}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                      filter === 'mine'
                        ? 'bg-primary text-white shadow'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {t('home.filterMine')}
                  </button>
                </div>

                <Link
                  to={PATHS.CREATE_REPORT}
                  className='rounded-full bg-primary px-4 py-2 text-center text-sm font-medium text-white transition-all hover:opacity-90'
                >
                  {t('home.createReport')}
                </Link>
              </div>
            )
          )}

          <div className='flex flex-wrap gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm items-baseline-last'>
            <div className='flex min-w-40 flex-col gap-0.5'>
              <label className='text-xs font-medium text-gray-400'>
                {t('home.category')}
              </label>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className='cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
              >
                <option value=''>{t('home.allCategories')}</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {getTranslatedCategoryLabel(category.name)}
                  </option>
                ))}
              </select>
            </div>

            <div className='flex min-w-36 flex-col gap-0.5'>
              <label className='text-xs font-medium text-gray-400'>
                {t('home.status')}
              </label>
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className='cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
              >
                <option value=''>{t('home.allStatuses')}</option>
                {REPORT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {getTranslatedStatusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div className='flex min-w-44 flex-col gap-0.5'>
                <label className='text-xs font-medium text-gray-400'>
                  {t('home.moderationStatus')}
                </label>
                <select
                  value={selectedModerationStatus}
                  onChange={(event) =>
                    setSelectedModerationStatus(event.target.value)
                  }
                  className='cursor-pointer rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary'
                >
                  <option value=''>{t('home.allModerationStatuses')}</option>
                  {MODERATION_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {getTranslatedModerationStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {hasActiveFilters && (
              <button
                type='button'
                onClick={handleClearFilters}
                className='text-xs font-medium text-primary transition-all hover:underline hover:cursor-pointer'
              >
                {t('home.clearFiltersAction')}
              </button>
            )}

            {hasActiveFilters && (
              <div className='flex flex-wrap gap-2'>
                {selectedCategory && (
                  <span className='flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs text-primary'>
                    {getTranslatedCategoryLabel(selectedCategory)}
                    <button
                      type='button'
                      onClick={() => setSelectedCategory('')}
                      className='transition-colors hover:text-red-500 hover:cursor-pointer'
                    >
                      <IoMdClose />
                    </button>
                  </span>
                )}
                {selectedStatus && (
                  <span className='flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs text-primary'>
                    {getTranslatedStatusLabel(selectedStatus as ReportStatus)}
                    <button
                      type='button'
                      onClick={() => setSelectedStatus('')}
                      className='transition-colors hover:text-red-500 hover:cursor-pointer'
                    >
                      <IoMdClose />
                    </button>
                  </span>
                )}
                {selectedModerationStatus && (
                  <span className='flex items-center gap-1 rounded-full border border-purple-100 bg-purple-50 px-2 py-0.5 text-xs text-primary'>
                    {getTranslatedModerationStatusLabel(
                      selectedModerationStatus as ModerationStatus,
                    )}
                    <button
                      type='button'
                      onClick={() => setSelectedModerationStatus('')}
                      className='transition-colors hover:text-red-500 hover:cursor-pointer'
                    >
                      <IoMdClose />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {displayedReports.length > 0 ? (
            displayedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))
          ) : (
            <div className='flex flex-col items-center gap-2 py-16 text-center text-gray-500'>
              <span className='text-4xl'>{t('home.noReports')}</span>
              <p className='font-medium'>{t('home.noReports_View')}</p>
              {hasActiveFilters && (
                <button
                  type='button'
                  onClick={handleClearFilters}
                  className='mt-1 text-sm text-primary hover:underline'
                >
                  {t('home.clearFilters')}
                </button>
              )}
            </div>
          )}

          {!hasActiveFilters && displayedReports.length > 0 && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onNext={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              onPrev={() => setPage((current) => Math.max(1, current - 1))}
            />
          )}
        </div>
      </Grow>
    </div>
  )
}
