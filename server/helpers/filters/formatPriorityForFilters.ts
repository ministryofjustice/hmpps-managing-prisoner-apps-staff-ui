// eslint-disable-next-line import/prefer-default-export
export const formatPriorityForFilters = (selectedFilters: { priority: string[] }, firstNightCenterCount: number) => [
  {
    value: 'first-night-centre',
    text: `First night or early days centre (${firstNightCenterCount})`,
    checked: selectedFilters.priority.includes('first-night-centre'),
  },
]
