// Usa a API padrão de Notification (não chrome.notifications) de propósito: funciona tanto
// com a extensão instalada quanto rodando via `npm run dev` como página comum (ver docs/architecture.md).
// No Windows, o Chrome renderiza esses alertas como toast nativo perto do relógio (Central de Ações),
// sem precisarmos posicionar nada — é o comportamento padrão do sistema operacional.

export type NotificationSupport = NotificationPermission | "unsupported";

export function getNotificationPermission(): NotificationSupport {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationSupport> {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}

export function notify(title: string, body: string): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const notification = new Notification(title, { body });
  notification.onclick = () => window.focus();
}
