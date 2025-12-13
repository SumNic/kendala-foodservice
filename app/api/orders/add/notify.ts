import { DayMenu, Dish } from "@/app/page";
import { Order } from "@/lib/api";

const TG_BOT_TOKEN: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
const TG_GROUP_ID: string | undefined = process.env.TELEGRAM_GROUP_ID;

interface ProcessedOrderDay {
  day: string;
  date: string;
  selectedDishes: string[]; // Массив названий блюд, а не ID
  deliveryTime: string;
  quantity: number;
  price: string;
}

interface ProcessedOrder extends Omit<Order, 'orderDays'> {
  orderDays: ProcessedOrderDay[];
}

function isUrgent(order: ProcessedOrderDay[]): boolean {
  const current = new Date;
  current.setMinutes(current.getMinutes() + current.getTimezoneOffset() + 300);  // пересчёт часового пояса
  const today = current.toDateString();
  return order.orderDays.some(day => new Date(day.date).toDateString() === today);
}

function cleanHTML(str: string | number): string {
  return String(str).replace(/[<>&]/g, char =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[char] as string),
  );
}

function createOrderEmailHtml(id: number, order: ProcessedOrder): string {
  const isRushOrder = isUrgent(order);
  const isRushOrderString = isRushOrder ? '<p style="margin:0 0 0.2em 0"><b>[СРОЧНО]</b></p>' : "";

  let orderDaysString = "";
  let lastOrderDate: string | null = null;
  let orderQuantityTotal = 0;

  for (const day of order.orderDays) {
    if (day.date !== lastOrderDate) {
      if (lastOrderDate !== null) orderDaysString += "</tbody>";
      orderDaysString += '<tbody style="border-top:4px double">';
      lastOrderDate = day.date;
    }

    orderDaysString += `
      <tr>
        <td style="padding:0.2em 0.4em;border:1px solid;text-align:center">${cleanHTML(day.date)}</td>
        <td style="padding:0.2em 0.4em;border:1px solid">${cleanHTML(day.selectedDishes.join(', '))}</td>
        <td style="padding:0.2em 0.4em;border:1px solid;text-align:right">${cleanHTML(day.quantity)}</td>
        <td style="padding:0.2em 0.4em;border:1px solid;text-align:right">${cleanHTML(day.price)}</td>
      </tr>
    `;

    orderQuantityTotal += Number(day.quantity);
  }

  if (order.orderDays.length > 0) {
    orderDaysString += "</tbody>";
  }

  return `<!DOCTYPE html>
  <html>
  <head></head>
  <body style="font-family:Arial,sans-serif;font-size:12pt">
    <h1 style="font-size:1.6em;font-weight:bolder;margin:0 0 1em 0">Новый заказ</h1>
    <div style="margin:0 0 1em 0">
      <p><b>Номер заказа</b> ${cleanHTML(id)}</p>
      <p><b>Дата оформления:</b> ${cleanHTML(order.timestamp.split("T")[0])}</p>
      ${isRushOrderString}
    </div>
    <div style="margin:0 0 1em 0">
      <p><b>Данные клиента</b></p>
      <ul>
        <li><b>Имя:</b> ${cleanHTML(order.customer.fullName)}</li>
        <li><b>Компания:</b> ${cleanHTML(order.customer.company)}</li>
        <li><b>Офис:</b> ${cleanHTML(order.customer.office)}</li>
        <li><b>Этаж:</b> ${cleanHTML(order.customer.floor)}</li>
        <li><b>Телефон:</b> ${cleanHTML(order.customer.phone)}</li>
      </ul>
    </div>
    <div style="margin:0 0 1em 0">
      <p><b>Состав заказа</b></p>
      <table style="border-collapse:collapse">
        <thead>
          <tr>
            <th style="padding:0.4em;border:1px solid">Дата доставки</th>
            <th style="padding:0.4em;border:1px solid">Блюда</th>
            <th style="padding:0.4em;border:1px solid">Кол-во</th>
            <th style="padding:0.4em;border:1px solid">Сумма</th>
          </tr>
        </thead>
        ${orderDaysString}
      </table>
    </div>
    <div>
      <p><b>Итоги по заказу</b></p>
      <ul>
        <li><b>Обедов всего:</b> ${orderQuantityTotal}</li>
        <li><b>Итоговая сумма:</b> ${cleanHTML(order.total)} тнг</li>
      </ul>
    </div>
  </body>
  </html>`;
}

export function createOrderTable(orderDays: ProcessedOrderDay[]): string {
  if (!orderDays?.length) {
    return "\n";
  }

  // Определяем максимальную ширину для каждой колонки
  const colWidths = [ 8, 5, 6, 5 ]; // Ширина ячеек заголовка

  orderDays.forEach(day => {
    const dateWidth = day.date?.length || 0;
    if (colWidths[0] < dateWidth) colWidths[0] = dateWidth;
    const quantityWidth = String(day.quantity || 0).length;
    if (colWidths[2] < quantityWidth) colWidths[2] = quantityWidth;
    const priceWidth = day.price.length;
    if (colWidths[3] < priceWidth) colWidths[3] = priceWidth;

    if (day.selectedDishes?.length) {
      day.selectedDishes.forEach(dish => {
        const dishWidth = dish.length || 0;
        if (colWidths[1] < dishWidth) colWidths[1] = dishWidth;
      });
    }
  });

  let table = '';

  // Разделители
  let tableHeaderRule = '';
  colWidths.forEach(w => tableHeaderRule += `+${'-'.repeat(w + 2)}`);
  tableHeaderRule += '+\n';

  const tableBodyRule = `+${'-'.repeat(colWidths.reduce((r, w) => r + w + 3, 0) - 1)}+\n`;

  // Шапка таблицы
  const tableHeader = [
    ['Дата', 'Блюда', 'Кол-во', 'Сумма'],
    ['доставки', '', '', ''],
  ];
  table = `${tableHeaderRule}`;
  tableHeader.forEach(headerRow => {
    table += '|';
    headerRow.forEach((text, column) => {
      const lPadding = Math.floor((colWidths[column] - text.length) / 2) + 1;
      const rPadding = colWidths[column] - lPadding - text.length + 2;
      table += `${' '.repeat(lPadding)}${text}${' '.repeat(rPadding)}|`;
    });
    table += '\n';
  });
  table += tableHeaderRule;

  // Строки таблицы
  orderDays.forEach(day => {
    day.selectedDishes?.forEach?.((dish: string, index: number) => {
      dish = String(dish || '');
      let date = '';
      let quantity = '';
      let price = '';
      if (index === 0) {
        date = day.date || '';
        quantity = String(day.quantity || 0);
        price = day.price;
      }
      table += `| ${date} ${' '.repeat(colWidths[0] - date.length)}`;
      table += `  ${dish} ${' '.repeat(colWidths[1] - dish.length)}`;
      table += `  ${' '.repeat(colWidths[2] - quantity.length)}${quantity} `; // выравнивание вправо
      table += `  ${' '.repeat(colWidths[3] - price.length)}${price} |\n`; // выравнивание вправо
    });
    table += tableBodyRule;
  });

  return table;
}

function cleanMarkdown(str: string | number): string {
  return String(str).replace(/([\\_*[\]()~`>#=|{}.!+-])/g, '\\$1');
}

function createOrderMessageText(id: number, order: ProcessedOrder): string {
  const isRushOrder = isUrgent(order);
  const isRushOrderString = isRushOrder ? "🚨 *\\[СРОЧНО\\]*\n" : "";

  const orderDaysTable = createOrderTable(order.orderDays);
  const orderDaysString = orderDaysTable ? '```\n' + orderDaysTable + '```\n' : '';
  const orderQuantityTotal = order.orderDays.reduce((sum: number, day: ProcessedOrderDay) => sum + Number(day.quantity), 0);

  return `🛒 *Новый заказ*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Номер заказа* ${cleanMarkdown(id)}
*Дата оформления:* ${cleanMarkdown(order.timestamp.split("T")[0])}
${isRushOrderString}
🧑 *Данные клиента*
 • *Имя:* ${cleanMarkdown(order.customer.fullName)}
 • *Компания:* ${cleanMarkdown(order.customer.company)}
 • *Офис:* ${cleanMarkdown(order.customer.office)}
 • *Этаж:* ${cleanMarkdown(order.customer.floor)}
 • *Телефон:* ${cleanMarkdown(order.customer.phone)}

🍲 *Состав заказа*
${orderDaysString}
🧾 *Итоги по заказу*
 • *Обедов всего:* ${cleanMarkdown(orderQuantityTotal)}
 • *Итоговая сумма:* ${cleanMarkdown(order.total)} тнг
`;
}

function sendEmailNotification(id: number, order: ProcessedOrder): Promise<Response> {
  const html = createOrderEmailHtml(id, order);

  const mailBody = {
    subject: `${isUrgent(order) ? "[СРОЧНО] " : ""}Новый заказ ${id}`,
    body: html,
  };

  const formBody = new URLSearchParams(mailBody).toString();
  return fetch('https://ibronevik.ru/taxi/c/0/api/v1/mail/4/send', {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formBody,
  });
}

function sendTelegramNotification(id: number, order: ProcessedOrder): Promise<Response> {
  if (!TG_BOT_TOKEN || !TG_GROUP_ID) {
    console.warn("Telegram bot token or group ID is not defined. Skipping Telegram notification.");
    return Promise.resolve(new Response(null, { status: 200 }));
  }

  const body = JSON.stringify({
    chat_id: TG_GROUP_ID,
    text: createOrderMessageText(id, order),
    parse_mode: 'MarkdownV2',
    disable_notification: false
  });

  return fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body
  });
}

export default async function sendOrderNotifications(
  id: number,
  order: Order,
  menu: DayMenu[],
  price: number[],
): Promise<void> {
  try {
    const dishes: Record<string, string> = menu.reduce(
      (ret: Record<string, string>, menuDay: DayMenu) => {
        menuDay.dishes.forEach(dish => {
          if (dish.id && dish.name) ret[dish.id] ||= dish.name;
        });
        return ret;
      },
      {}
    );

    const orderDaysData: ProcessedOrderDay[] = order.orderDays.map(day => {
      const mealPrice = price[day.selectedDishes.length === 2 ? 0 : 1] || '—';
      return {
        ...day,
        selectedDishes: day.selectedDishes.map(dishId => dishes[dishId] || '—'),
        price: `${mealPrice} тг`
      };
    });

    const orderData: ProcessedOrder = {
      customer: order.customer,
      orderDays: orderDaysData,
      total: order.total,
      timestamp: order.timestamp
    };

    const results = await Promise.allSettled([
      sendEmailNotification(id, orderData),
      sendTelegramNotification(id, orderData)
    ]);

    if (results.some(result => !result.value?.ok)) {
      throw new Error('Order notification failed');
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Ошибка в sendOrderNotifications:', message);
    // may rethrow the error here
  }
}
