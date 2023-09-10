import '../scss/style.scss'
import * as bootstrap from 'bootstrap'
let apiUrl: string = 'http://localhost:3000/transactions/'
interface Transaction {
    id?: number,
    name: string,
    amount: number,
}
let transactions: Transaction[] = []

const getTransactions = async (apiUrl: string) => {
    const response: Transaction[] = await fetch(apiUrl).then(res => res.json())
    return response
}

const formatedAmount = (amount: number) => {
    const formatAmount = Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', })
    return formatAmount.format(amount)
}

// CREATE TRANSACTION CONTAINER
const createTransactionContainer = (id: number) => {
    const transactioncontainer: HTMLDivElement = document.createElement('div')
    transactioncontainer.classList.add('d-flex', 'transaction', `transaction-${id}`)
    return transactioncontainer
}

// CREATE TRANSACTION TITLE
const createTitle = (name: string) => {
    const title = document.createElement('span')
    title.textContent = name
    return title
}

// CREATE TRANSACTION VALUE
const createAmount = (amount: number) => {
    const amt = document.createElement('span')
    if (amount > 0) {
        amt.classList.add('success')
    }
    else if (String(amount)[0] === '-') {
        amt.classList.add('error')
    }
    amt.classList.add('spanAmount')
    amt.textContent = formatedAmount(amount)
    return amt
}

// CREATE EDIT BUTTON
const createEditBtn = (transaction: Transaction) => {
    const btnEdit = document.createElement('button')
    btnEdit.classList.add('btn', 'btn-primary', `editBtn-${transaction.id}`)
    btnEdit.textContent = 'Editar'

    btnEdit.addEventListener('click', () => {

        const inputHidden = document.querySelector('.hidden')
        const inputTitle: HTMLInputElement | null = document.querySelector('#inputTitle')
        const inputAmount: HTMLInputElement | null = document.querySelector('#inputAmount')

        if (inputHidden && inputTitle && inputAmount) {
            inputHidden.id = String(transaction.id)
            inputTitle.value = transaction.name
            inputAmount.value = String(transaction.amount)
        }
    })

    return btnEdit
}

// CREATE REMOVE BUTTON
const createRemoveBtn = (transaction: Transaction) => {
    const btnRemove = document.createElement('button')
    btnRemove.classList.add('btn', 'btn-danger', `removeBtn-${transaction.id}`)
    btnRemove.textContent = 'Excluir'
    btnRemove.addEventListener('click', async () => {
        const response = await fetch(`${apiUrl}${transaction.id}`, { method: 'DELETE' })
        document.querySelector(`.transaction-${transaction.id}`)?.remove()


        transactions.splice(transactions.findIndex(trans => trans.id === transaction.id), 1)
        renderTotal()
    })
    return btnRemove
}

// CREATE TRANSACTION 
const createTransaction = (transaction: Transaction) => {
    const transactions = document.querySelector('#transactionsContainer')

    const container = createTransactionContainer(Number(transaction.id))
    const title = createTitle(transaction.name)
    const amount = createAmount(transaction.amount)

    const editBtn = createEditBtn(transaction)
    const removeBtn = createRemoveBtn(transaction)
    container.append(title, amount, editBtn, removeBtn)
    transactions?.appendChild(container)

}

// CREATE NEW TRANSACTION
const addTransaction = () => {
    const inputHidden: HTMLInputElement | null = document.querySelector('.hidden')
    const inputTitle: HTMLInputElement | null = document.querySelector('#inputTitle')
    const inputAmount: HTMLInputElement | null = document.querySelector('#inputAmount')
    const saveBtn = document.querySelector('#saveBtn')

    if (inputTitle && inputHidden && inputAmount && saveBtn) {
        saveBtn.addEventListener('click', async (ev) => {
            ev.preventDefault()

            try {
                if (inputHidden.id) {
                    const transactionId = inputHidden.id
                    const transactionEdit = await fetch(`${apiUrl}${transactionId}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            name: inputTitle.value,
                            amount: parseFloat(inputAmount.value)
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }

                    }).then(res => res.json())

                    const transactionIndex = transactions.findIndex(transaction => transaction.id === parseFloat(transactionId))
                    transactions.splice(transactionIndex, 1, transactionEdit)
                    renderTransaction(transactionEdit)
                    document.querySelector(`.transaction-${transactionId}`)?.remove()
                } else {
                    if (inputTitle.value === '') {
                        const error = new Error('Adicione o Nome da transação')
                        throw error
                    } else if (inputAmount.value === '') {
                        const error = new Error('Adicione o Valor da transação')
                        throw error
                    }
                    else {
                        const transaction: Transaction = {
                            name: inputTitle.value,
                            amount: parseFloat(inputAmount.value)
                        }
                        const response: Transaction = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(transaction)
                        }).then(res => res.json())

                        transactions.push(response)
                        createTransaction(response)
                    }
                }
                const titleError:Element | null  = document.querySelector('#titleError')
                const amountError:Element | null  = document.querySelector('#amountError')
                if(titleError && amountError){
                titleError.textContent = ''
                amountError.textContent = ''
                inputAmount.style.borderColor = '#000'
                inputTitle.style.borderColor = '#000'

            }
                inputHidden.id = ''
                inputTitle.value = ''
                inputAmount.value = ''
                
            } catch (error) {

                const titleError:Element | null  = document.querySelector('#titleError')
                const amountError:Element | null  = document.querySelector('#amountError')
                if (titleError && error.message.includes('Nome')){
                    titleError.textContent = error.message
                    inputTitle.style.border = '2px solid red' 
                } else if(amountError && error.message.includes('Valor')){
                    amountError.textContent = error.message
                    inputAmount.style.border = '2px solid red'

                }    
            }
            
            renderTotal()
        })    
    }
}

// RENDERS TRANSACTIONS ON SCREEN
const renderTransactions = async () => {
    addTransaction()
    const response: Transaction[] = await getTransactions(apiUrl)
    response.forEach(transaction => {
        transactions.push(transaction)
    })
    transactions.forEach(transaction => {
        createTransaction(transaction)
    })
    renderTotal()
}

// RENDERS A TRANSACTION TO THE SCREEN
const renderTransaction = (transaction: Transaction) => {
    createTransaction(transaction)
}

// SHOW TOTAL
const renderTotal = () => {
    const totalValue = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    const total = document.querySelector('#total')
    if (total) {
        total.textContent = formatedAmount(totalValue)
    }
}

document.addEventListener('DOMContentLoaded', renderTransactions)