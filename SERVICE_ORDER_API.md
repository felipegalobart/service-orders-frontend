# Service Orders API Documentation

## Visão Geral

A API de Service Orders permite gerenciar ordens de serviço de equipamentos eletrônicos, incluindo controle de status, cálculos financeiros, busca avançada e geração automática de números sequenciais.

**Base URL:** `http://localhost:3000/service-orders`

## Autenticação

Todas as rotas requerem autenticação via JWT Bearer Token:

```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. CRUD Básico

#### 1.1 Criar Ordem de Serviço

```http
POST /service-orders
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**

```json
{
  "customerId": "string (required)",
  "equipment": "string (required)",
  "model": "string (optional)",
  "brand": "string (optional)",
  "serialNumber": "string (optional)",
  "voltage": "string (optional)",
  "accessories": "string (optional)",
  "customerObservations": "string (optional)",
  "reportedDefect": "string (optional)",
  "warranty": "boolean (default: false)",
  "isReturn": "boolean (default: false)",
  "entryDate": "string (ISO date, optional)",
  "deliveryDate": "string (ISO date, optional)",
  "notes": "string (optional)",
  "financial": "string (enum: em_aberto, pago, parcialmente_pago, deve, faturado, vencido, cancelado)",
  "paymentType": "string (enum: cash, installment, store_credit)",
  "installmentCount": "number (default: 1)",
  "services": [
    {
      "description": "string (required)",
      "quantity": "number (default: 1)",
      "value": "number (required)",
      "discount": "number (default: 0)",
      "addition": "number (default: 0)"
    }
  ]
}
```

**Response (201):**

```json
{
  "id": "string",
  "orderNumber": "number (auto-generated)",
  "customerId": "string",
  "equipment": "string",
  "model": "string",
  "brand": "string",
  "serialNumber": "string",
  "voltage": "string",
  "accessories": "string",
  "customerObservations": "string",
  "reportedDefect": "string",
  "warranty": "boolean",
  "isReturn": "boolean",
  "status": "string (default: confirmar)",
  "entryDate": "string (ISO date)",
  "deliveryDate": "string (ISO date)",
  "notes": "string",
  "financial": "string",
  "invoiceItemIds": "array",
  "paymentType": "string",
  "installmentCount": "number",
  "paidInstallments": "number (default: 0)",
  "servicesSum": "number (calculated)",
  "totalDiscount": "number (calculated)",
  "totalAddition": "number (calculated)",
  "totalAmountPaid": "number (calculated)",
  "totalAmountLeft": "number (calculated)",
  "isActive": "boolean (default: true)",
  "services": "array",
  "createdAt": "string (ISO date)",
  "updatedAt": "string (ISO date)"
}
```

#### 1.2 Listar Ordens de Serviço

```http
GET /service-orders?page=1&limit=10&status=confirmar&financial=em_aberto
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (number, optional): Página (default: 1)
- `limit` (number, optional): Itens por página (default: 10)
- `status` (string, optional): Filtrar por status
- `financial` (string, optional): Filtrar por status financeiro

**Response (200):**

```json
{
  "data": [
    {
      "id": "string",
      "orderNumber": "number",
      "customerId": "string",
      "equipment": "string",
      "status": "string",
      "financial": "string",
      "entryDate": "string",
      "deliveryDate": "string",
      "servicesSum": "number",
      "totalAmountLeft": "number",
      "isActive": "boolean",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number"
}
```

#### 1.3 Buscar Ordem por ID

```http
GET /service-orders/:id
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": "string",
  "orderNumber": "number",
  "customerId": "string",
  "equipment": "string",
  "model": "string",
  "brand": "string",
  "serialNumber": "string",
  "voltage": "string",
  "accessories": "string",
  "customerObservations": "string",
  "reportedDefect": "string",
  "warranty": "boolean",
  "isReturn": "boolean",
  "status": "string",
  "entryDate": "string",
  "deliveryDate": "string",
  "notes": "string",
  "financial": "string",
  "invoiceItemIds": "array",
  "paymentType": "string",
  "installmentCount": "number",
  "paidInstallments": "number",
  "servicesSum": "number",
  "totalDiscount": "number",
  "totalAddition": "number",
  "totalAmountPaid": "number",
  "totalAmountLeft": "number",
  "isActive": "boolean",
  "services": "array",
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### 1.4 Atualizar Ordem de Serviço

```http
PUT /service-orders/:id
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:** (mesmo formato do POST, todos os campos opcionais)

**Response (200):** (mesmo formato do GET por ID)

#### 1.5 Excluir Ordem de Serviço (Soft Delete)

```http
DELETE /service-orders/:id
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Ordem de serviço excluída com sucesso"
}
```

### 2. Buscas Específicas

#### 2.1 Buscar por Número da Ordem

```http
GET /service-orders/by-order-number?q=123
Authorization: Bearer <token>
```

#### 2.2 Buscar por Cliente (ID)

```http
GET /service-orders/by-customer?customerId=64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer <token>
```

#### 2.3 Buscar por Status

```http
GET /service-orders/by-status?q=confirmar
Authorization: Bearer <token>
```

#### 2.4 Buscar por Equipamento

```http
GET /service-orders/by-equipment?q=Notebook
Authorization: Bearer <token>
```

#### 2.5 Buscar por Modelo

```http
GET /service-orders/by-model?q=Inspiron
Authorization: Bearer <token>
```

#### 2.6 Buscar por Marca

```http
GET /service-orders/by-brand?q=Dell
Authorization: Bearer <token>
```

#### 2.7 Buscar por Número de Série

```http
GET /service-orders/by-serial-number?q=DL123456789
Authorization: Bearer <token>
```

#### 2.8 Buscar por Nome do Cliente

```http
GET /service-orders/by-customer-name?q=João
Authorization: Bearer <token>
```

#### 2.9 Buscar por Razão Social

```http
GET /service-orders/by-customer-corporate-name?q=Empresa
Authorization: Bearer <token>
```

#### 2.10 Buscar por Nome Fantasia

```http
GET /service-orders/by-customer-trade-name?q=Fantasia
Authorization: Bearer <token>
```

#### 2.11 Busca Geral

```http
GET /service-orders/search?q=termo
Authorization: Bearer <token>
```

### 3. Gestão de Status

#### 3.1 Atualizar Status Técnico

```http
PUT /service-orders/:id/status
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**

```json
{
  "status": "string (enum: confirmar, aprovado, pronto, entregue, reprovado)"
}
```

#### 3.2 Atualizar Status Financeiro

```http
PUT /service-orders/:id/financial-status
Content-Type: application/json
Authorization: Bearer <token>
```

**Body:**

```json
{
  "financial": "string (enum: em_aberto, pago, parcialmente_pago, deve, faturado, vencido, cancelado)"
}
```

### 4. Sequência Numérica

#### 4.1 Obter Número Atual

```http
GET /service-orders/sequence/current
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "currentNumber": "number"
}
```

#### 4.2 Informações da Sequência

```http
GET /service-orders/sequence/info
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "currentNumber": "number",
  "exists": "boolean"
}
```

## Enums e Valores

### Status Técnico

- `confirmar` - Aguardando confirmação
- `aprovado` - Aprovado para execução
- `pronto` - Pronto para entrega
- `entregue` - Entregue ao cliente
- `reprovado` - Reprovado

### Status Financeiro

- `em_aberto` - Em aberto
- `pago` - Pago
- `parcialmente_pago` - Parcialmente pago
- `deve` - Deve
- `faturado` - Faturado
- `vencido` - Vencido
- `cancelado` - Cancelado

### Tipos de Pagamento

- `cash` - À vista
- `installment` - Parcelado
- `store_credit` - Crédito na loja

## Códigos de Erro

### 400 - Bad Request

```json
{
  "statusCode": 400,
  "message": "Mensagem de erro específica",
  "error": "Bad Request"
}
```

### 401 - Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 404 - Not Found

```json
{
  "statusCode": 404,
  "message": "Ordem de serviço não encontrada",
  "error": "Not Found"
}
```

### 500 - Internal Server Error

```json
{
  "statusCode": 500,
  "message": "Erro interno do servidor",
  "error": "Internal Server Error"
}
```

## Exemplos de Uso

### Criar uma Ordem de Serviço Simples

```javascript
const response = await fetch('/service-orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + token,
  },
  body: JSON.stringify({
    customerId: '64f1a2b3c4d5e6f7g8h9i0j1',
    equipment: 'Notebook Dell Inspiron 15',
    model: 'Inspiron 15 3000',
    brand: 'Dell',
    serialNumber: 'DL123456789',
    customerObservations: 'Notebook não liga',
    reportedDefect: 'Falha na fonte de alimentação',
    warranty: true,
    services: [
      {
        description: 'Diagnóstico completo',
        quantity: 1,
        value: 80,
        discount: 0,
        addition: 0,
      },
    ],
  }),
});

const order = await response.json();
console.log('Ordem criada:', order);
```

### Buscar Ordens por Status

```javascript
const response = await fetch('/service-orders/by-status?q=confirmar', {
  headers: {
    Authorization: 'Bearer ' + token,
  },
});

const orders = await response.json();
console.log('Ordens encontradas:', orders);
```

### Atualizar Status de uma Ordem

```javascript
const response = await fetch(
  '/service-orders/64f1a2b3c4d5e6f7g8h9i0j1/status',
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    },
    body: JSON.stringify({
      status: 'aprovado',
    }),
  },
);

const updatedOrder = await response.json();
console.log('Status atualizado:', updatedOrder);
```

## Rate Limiting

A API implementa rate limiting por usuário. Limites padrão:

- **Criação/Atualização:** 10 requests por minuto
- **Consultas:** 100 requests por minuto

## Validações

### Campos Obrigatórios

- `customerId` - ID do cliente (deve existir no banco)
- `equipment` - Descrição do equipamento

### Validações de Negócio

- Cliente deve existir no banco de dados
- Datas de entrega não podem ser anteriores à data de entrada
- Valores financeiros devem ser positivos
- Quantidade de serviços deve ser maior que 0

### Cálculos Automáticos

- `servicesSum` - Soma total dos serviços
- `totalDiscount` - Total de descontos
- `totalAddition` - Total de acréscimos
- `totalAmountLeft` - Valor restante a pagar

## Notas Importantes

1. **Números Sequenciais:** Gerados automaticamente, não podem ser alterados
2. **Soft Delete:** Ordens são marcadas como inativas, não removidas fisicamente
3. **Timestamps:** `createdAt` e `updatedAt` são gerenciados automaticamente
4. **Validação de Cliente:** O `customerId` deve referenciar um cliente existente
5. **Cálculos:** Totais são calculados automaticamente baseados nos serviços
6. **Status:** Mudanças de status são auditadas e podem ter regras de negócio específicas

## Integração com Frontend

### Estados Recomendados

```javascript
// Estados para gerenciar ordens de serviço
const [orders, setOrders] = useState([]);
const [currentOrder, setCurrentOrder] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [filters, setFilters] = useState({
  status: '',
  financial: '',
  page: 1,
  limit: 10,
});
```

### Hooks Úteis

```javascript
// Hook para buscar ordens
const useServiceOrders = (filters) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/service-orders?${new URLSearchParams(filters)}`,
        );
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Erro ao buscar ordens:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [filters]);

  return { orders, loading };
};
```

Esta documentação fornece todas as informações necessárias para implementar o frontend da API de Service Orders.
