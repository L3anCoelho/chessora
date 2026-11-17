/**
 * Contrato para as futuras partidas online. NÃO há implementação nesta etapa e nenhuma tela
 * oferece jogo online. Quando for implementado (ex.: Supabase Realtime + tabela de salas),
 * a página de jogo usará este transporte no lugar do motor ou do segundo jogador local.
 *
 * Regras que a implementação deve seguir:
 * - O servidor valida cada lance com as mesmas regras (chess.js numa Edge Function),
 *   nunca confiando só no navegador.
 * - O relógio é controlado pelo servidor; o cliente apenas exibe.
 * - Reconexão: o cliente recarrega a partida pelo PGN salvo na sala.
 */
import type { ChessGame, GameMove, PlayerColor } from '@/types/domain';

export interface OnlineRoom {
  id: string;
  inviteCode: string;
  hostUserId: string;
  guestUserId: string | null;
  status: 'waiting' | 'playing' | 'finished';
  timeControl: { initialSeconds: number; incrementSeconds: number };
}

export interface OnlineGameTransport {
  createRoom(timeControl: OnlineRoom['timeControl']): Promise<OnlineRoom>;
  joinRoom(inviteCode: string): Promise<{ room: OnlineRoom; color: PlayerColor }>;
  submitMove(roomId: string, move: Pick<GameMove, 'from' | 'to' | 'promotion'>): Promise<void>;
  /** Recebe lances confirmados pelo servidor. Retorna função para cancelar a inscrição. */
  onMove(roomId: string, handler: (move: GameMove) => void): () => void;
  /** Estado completo para reconexão. */
  loadGame(roomId: string): Promise<ChessGame>;
  resign(roomId: string): Promise<void>;
}
