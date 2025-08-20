export const useFormatDate = (dateStr: string) => {
  const date = new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return {
    date,
  }
}
