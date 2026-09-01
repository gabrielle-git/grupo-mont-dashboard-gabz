type PageTabsProps<T extends string> = {
  tabs: { id: T; label: string }[]
  activeTab: T
  onTabChange: (tab: T) => void
}

export function PageTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: PageTabsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={[
            'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
