/**
 * Define o Model (estrutura de dados) para uma única tarefa (To-Do Item).
 * @param {string} text - O conteúdo da tarefa.
 * @param {boolean} completed - O estado de conclusão da tarefa (padrão: false).
 * @param {string} id - Um ID único gerado automaticamente.
 */
export class TodoModel {
  constructor(text, completed = false) {
    this.id = Date.now().toString(); // ID único simples baseado no timestamp
    this.text = text;
    this.completed = completed;
  }
}
