export interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  action?: () => void
  onNext?: () => void
}

export const balanceTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to the Transaction System!',
    description: 'This tutorial will guide you through the main features for performing transactions in the system. Let\'s get started!',
  },
  {
    id: 'team-selector',
    title: 'Team Selection',
    description: 'First, select the team for which you want to view and perform transactions. Use the team selector at the top of the page.',
    targetSelector: '[data-tutorial="team-selector"]',
    position: 'bottom',
  },
  {
    id: 'date-filter',
    title: 'Date Filter',
    description: 'Use the date filter to view transactions from a specific day. This helps organize information better.',
    targetSelector: '[data-tutorial="date-filter"]',
    position: 'bottom',
  },
  {
    id: 'currency-toggle',
    title: 'Currency Toggle',
    description: 'You can switch between Gold and Dollar (USD).',
    targetSelector: '[data-tutorial="currency-toggle"]',
    position: 'bottom',
  },
  {
    id: 'balance-table',
    title: 'Balance Control Table',
    description: 'This is the main table where you can view your teams balances. Here you will find detailed information about each team member.',
    targetSelector: '[data-tutorial="balance-table"]',
    position: 'top',
  },
  {
    id: 'gbank-list',
    title: 'GBank List',
    description: 'Here you can view and manage available GBanks. This section shows information about guild banks and their transactions.',
    targetSelector: '[data-tutorial="gbank-list"]',
    position: 'left',
  },
  {
    id: 'gbank-expand',
    title: 'Expand GBank Section',
    description: 'Click "Next" to automatically expand the GBank section and see the individual GBank accounts. This will reveal the transaction input fields.',
    targetSelector: '[data-tutorial="gbank-expand"]',
    position: 'left',
    onNext: () => {
      // Encontra o primeiro accordion de GBank e o expande
      const accordionSummary = document.querySelector('[data-tutorial="gbank-expand"]') as HTMLElement
      if (accordionSummary) {
        accordionSummary.click()
      }
    },
  },
  {
    id: 'gbank-transactions',
    title: 'GBank Transactions',
    description: 'To create a new GBank transaction, enter the amount in the input field and press Enter. This will open a form for you to fill in the transaction details.',
    targetSelector: '[data-tutorial="gbank-transactions"]',
    position: 'left',
  },
  {
    id: 'completion',
    title: 'Tutorial Completed!',
    description: 'Congratulations! You now know the main features of the transaction system. If you need help again, click the tutorial button in the corner of the screen.',
  },
]

export const getTutorialStepById = (id: string): TutorialStep | undefined => {
  return balanceTutorialSteps.find(step => step.id === id)
}

export const getTutorialStepIndex = (id: string): number => {
  return balanceTutorialSteps.findIndex(step => step.id === id)
}
