// API utility functions for backend integration
import { DayMenu } from "@/app/page"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface ApiResponse<T> {
	success: boolean
	data?: T
	error?: string
}

export interface MenuUpload {
	data: string
	token?: string
	u_hash?: string
}

export const statuses = ["new", "accepted", "paid", "delivered"] as const;

export interface Order {
	id?: string
	customer: {
		fullName: string
		phone: string
		office: string
		floor: string
		company: string
	}
	orderDays: Array<{
		day: string
		date: string
		selectedDishes: string[]
		deliveryTime: string
		quantity: number
	}>
	paymentMethod: "cash" | "invoice"
	total: number
	timestamp: string
	status?: typeof statuses[number]
}

export interface RegisterPayload {
	u_name: string
	u_phone?: string
	u_email?: string
	u_tg?: string
	u_wa?: string
	u_role: number
	st?: "true"
	data?: string
}

export interface LoginPayload {
	login: string
	password?: string
	type: "telegram_id" | "whatsapp" | "e-mail"
}

export interface TokenPayload {
	auth_hash: string
}

export interface MenuRes {
	day: number
	name: string
	description: string
	calories: number
}

export interface LoginRes {
	auth_hash?: string
}

export interface TokenAndHash {
	data: {
		token?: string
		u_hash?: string
	}
}

export interface ExportExcelOrder {
	token?: string
	u_hash?: string
	is_var: number
	s_t_data: {
		date_from: string
		date_to: string
	}
}

// Auth API
export const authApi = {
	async register(data: RegisterPayload): Promise<ApiResponse<any>> {
		const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
			method: "POST",
			body: JSON.stringify(data),
		})
		return response.json()
	},

	async login(data: LoginPayload): Promise<ApiResponse<LoginRes>> {
		const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
			method: "POST",
			body: JSON.stringify(data),
		})
		return response.json()
	},

	async token(data: TokenPayload): Promise<ApiResponse<TokenAndHash>> {
		const response = await fetch(`${API_BASE_URL}/api/auth/token`, {
			method: "POST",
			body: JSON.stringify(data),
		})
		return response.json()
	},

	async logout(): Promise<ApiResponse<any>> {
		const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
			method: "GET",
		})
		return response.json()
	},
}

// Menu API
export const menuApi = {
	async uploadMenu(data: MenuUpload): Promise<ApiResponse<any>> {
		const response = await fetch(`${API_BASE_URL}/api/menu/upload`, {
			method: "POST",
			body: JSON.stringify(data),
		})
		return response.json()
	},

	async getMenu(): Promise<ApiResponse<MenuRes[]>> {
		const response = await fetch(`${API_BASE_URL}/api/menu/week`, {
			method: "GET",
		})
		return response.json()
	},
}

// Orders API
export const ordersApi = {
	async createOrder(order: Order, menu: DayMenu[]): Promise<ApiResponse<Order>> {
		try {
			const response = await fetch(`${API_BASE_URL}/api/orders/add`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({order, menu}),
			})
			return await response.json()
		} catch (error) {
			return { success: false, error: "Network error" }
		}
	},

	async getOrders(data: TokenAndHash['data']): Promise<ApiResponse<any>> {
		try {
			const response = await fetch(`${API_BASE_URL}/api/orders/get`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			})
			return await response.json()
		} catch (error) {
			return { success: false, error: "Network error" }
		}
	},

	async updateOrderStatus(orderId: string, newStatus: string): Promise<ApiResponse<Order>> {
		try {
			const response = await fetch(`${API_BASE_URL}/api/orders/status/${orderId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newStatus),
			})
			return await response.json()
		} catch (error) {
			return { success: false, error: "Network error" }
		}
	},

	async exportOrders(params: ExportExcelOrder): Promise<Blob> {
		const response = await fetch(`${API_BASE_URL}/api/orders/export`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		})
		if (!response.ok) {
			throw new Error(`Ошибка экспорта: ${response.status}`);
		}

		return await response.blob()
	},
}

// Email API
export const emailApi = {
	async sendOrderConfirmation(order: Order): Promise<ApiResponse<any>> {
		try {
			const response = await fetch(`${API_BASE_URL}/email/order-confirmation`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(order),
			})
			return await response.json()
		} catch (error) {
			return { success: false, error: "Network error" }
		}
	},
}

// Kitchen API
export const kitchenApi = {
	async getDishSummary(date: string): Promise<ApiResponse<any>> {
		try {
			const response = await fetch(`${API_BASE_URL}/kitchen/summary?date=${date}`)
			return await response.json()
		} catch (error) {
			return { success: false, error: "Network error" }
		}
	},
}
