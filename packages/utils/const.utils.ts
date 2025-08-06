// Formato de data padrão brasileiro
export const FORMAT_DATE_BR = 'dd/MM/yyyy'

// Regex para números positivos
export const PATTERN_NUMBER_POSITIVE = '^[+]?\\d+([.]\\d+)?$'

// Tipos de arquivo aceitos
export const ACCEPT_TYPES_ALL =
  'application/*, image/*, video/*, audio/*, text/*'
export const ACCEPT_TYPES_IMAGE = 'image/*'
export const ACCEPT_TYPES_PDF = 'application/pdf'
export const ACCEPT_TYPES_ZIP = '.zip'
export const ACCEPT_TYPES_XLS =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

// Tempo padrão máximo
export const TIMEOUT_DEFAULT_LONG_LIMIT: number = 300000

// Tipos defaults de tamanho de arquivos
export const fileSizeTypes = [
  'B',
  'KB',
  'MB',
  'GB',
  'TB',
  'PB',
  'EB',
  'ZB',
  'YB',
]

/**
 * Constantes relacionadas a mensagens exibidas no sistema.
 */
export const messageLoading = {
  DEFAULT: 'Processando...',
  LOADING: 'Carregando...',
  SAVING: 'Salvando...',
  UPDATING: 'Atualizando...',
  DELETING: 'Deletando...',
}

export const messageTitle = {
  SUCCESS: 'Sucesso',
  ERROR: 'Erro',
  WARNING: 'Aviso',
  INFORMATION: 'Informação',
}

/**
 * Tipos de "toasts" disponíveis no sistema para exibição de notificações ao usuário.
 */
export const toastTypes = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
}

/**
 * Mensagens defaults das aplicações.
 */
export const messengeDefaults = {
  DEFAULT_000:
    'Ops! Algo deu errado. Por favor, tente novamente mais tarde. Se o problema persistir, entre em contato com o suporte técnico.',
  DEFAULT_001:
    'Campos marcados com * são obrigatórios. Por favor, preencha esses campos e tente novamente.',
  DEFAULT_002:
    'Tem certeza de que deseja cancelar? As alterações feitas serão perdidas se não forem salvas. Essa ação não poderá ser desfeita.',
  DEFAULT_003: 'Registro salvo com sucesso.',
  DEFAULT_004: 'Registro atualizado com sucesso.',
  DEFAULT_005:
    'Tem certeza de que deseja excluir esse registro? Essa ação não poderá ser desfeita. Deseja confirmar?',
  DEFAULT_006: 'Registro excluído com sucesso.',
  DEFAULT_007:
    'Essa ação removerá todos os arquivos da lista de pendentes. Essa ação não poderá ser desfeita. Deseja realmente realizar essa ação?',
}

/**
 * Tipos disponíveis para colunas em tabelas ou componentes que exibem informações em formato tabular.
 */
export const columnTypes = {
  ATTACHMENT: 'attachment',
  TEXT: 'text',
  PHONE: 'phone',
  LINK: 'link',
  DATE: 'date',
  DATE_TIME: 'dateTime',
  BOOLEAN: 'boolean',
  CHECKBOX: 'checkbox',
  TIME: 'time',
  CPF_CNPJ: 'cpfCnpj',
  LABEL: 'label',
  MONETARY: 'monetary',
  YES_NO: 'yesNo',
  PERCENTAGE: 'percentage',
  INTEGER: 'integer',
  DECIMAL: 'decimal',
  BUTTONS: 'buttons',
}

/**
 * Tipos disponíveis para os inputs no sistema.
 */
export const inputTypes = {
  MONETARY: 'monetary',
  TEXT_EDITOR: 'textEditor',
  PASSWORD: 'password',
  NIF: 'nif',
  TIME: 'time',
  CURRENCY: 'currency',
  TIME_STRING: 'timeString',
  EMAIL: 'email',
  CPF: 'cpf',
  PHONE: 'phone',
  ZIP_CODE: 'zipCode',
  INTEGER: 'integer',
  DECIMAL: 'decimal',
  AUTOCOMPLETE: 'autoComplete',
  TEXT: 'text',
  TEXT_AREA: 'textArea',
  RADIO_BUTTON: 'radioButton',
  CHECKBOX: 'checkbox',
  RANGE: 'range',
  CALENDAR_YEAR: 'calendarYear',
  DATE: 'date',
  DATE_TIME: 'date_time',
  DATE_STRING: 'dateString',
  SWITCH: 'switch',
  PERCENTAGE: 'percentage',
  SELECT: 'select',
  SELECT_LAZY: 'select_lazy',
  URL: 'url',
  MULTI_SELECT_LAZY: 'multi_Select_lazy',
  MULTI_SELECT: 'multi_Select',
  MULTI_SELECT_TEMPLATE: 'multi_Select_Template',
  FILE_UPLOAD: 'file_upload',
}

/**
 * Endpoints das APIs..
 */
export const endpoints = {}

/**
 * Actions para validar permissões.
 */
export const actions = {
  LIST: 'listar',
  CREATE: 'criar',
  VIEW: 'visualizar',
  EDIT: 'editar',
  DELETE: 'excluir',
  ENABLE: 'habilitar',
  CLONE: 'cloanr',
  EXPORT: 'exportar',
  IMPORT: 'importar',
  CANCEL: 'cancelar',
}

/**
 * Subject para classificar o modulo antes de conceder a permissão.
 */
export const subjects = {}

/**
 * Breadcrumbs e títulos das páginas.
 */
export const breadcrumbsAndTitles = {
  HOME: 'Home',
  MESSENGER: 'Mensageria',
  IN_PROGRESS: 'Em construção',
  NOT_FOUND: 'Pagina não encontrada',
  FORBIDDEN: 'Acesso negado',
  PUBLICATION: 'Publicação',
  SMTP_CONFIG: 'Configuração SMTP',
  MENAGE: 'Gerenciar',
  SENDER: 'Remetente',
  CONFIGURATIONS: 'Configurações',
  ASSOCIATION: 'Associação',
  EMAIL_TEMPLATE: 'Template de E-mail',
  CAMPAIGNS: 'Campanha',
  REGISTRATIONS: 'Cadastros',
  CREATE: 'Criar',
  VIEW: 'Visualizar',
  CLONE: 'Clonar',
  EDIT: 'Editar',
}

/**
 * Paths das rotas das aplicações.
 */
export const pathRoutes = {
  IN_PROGRESS: 'in-progress',
  NOT_FOUND: 'not-found',
  FORBIDDEN: 'forbidden',
  ASSOCIATION: 'association',
  REGISTRATIONS: 'registration',
  CONFIGURATIONS: 'configurations',
  CREATE: 'create',
  VIEW: 'view',
  CLONE: 'clone',
  EDIT: 'edit',
}
