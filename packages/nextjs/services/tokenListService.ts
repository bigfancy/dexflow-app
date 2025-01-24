import { TokenInfo } from "@uniswap/token-lists";
import tokenList from "@/config/token_list.json";
import { MdToken, MdKeyboardArrowDown } from "react-icons/md";

export interface ExtendedTokenInfo extends TokenInfo {
  logoURI?: string;
}

class TokenListService {
  private static instance: TokenListService;
  private tokenList: ExtendedTokenInfo[] = [];
  private recentTokens: ExtendedTokenInfo[] = [];

  private constructor() {
    // 初始化时直接加载本地 token list
    this.tokenList = tokenList.tokens as ExtendedTokenInfo[];
  }

  public static getInstance(): TokenListService {
    if (!TokenListService.instance) {
      TokenListService.instance = new TokenListService();
    }
    return TokenListService.instance;
  }

  public async getTokenList(): Promise<ExtendedTokenInfo[]> {
    return this.tokenList;
  }

  public async searchTokens(query: string): Promise<ExtendedTokenInfo[]> {
    return this.tokenList.filter(
      (token) =>
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase()) ||
        token.address.toLowerCase().includes(query.toLowerCase())
    );
  }

  public getRecentTokens(): ExtendedTokenInfo[] {
    return this.recentTokens;
  }

  public addRecentToken(token: ExtendedTokenInfo) {
    this.recentTokens = [
      token,
      ...this.recentTokens.filter((t) => t.address !== token.address),
    ].slice(0, 5); // 只保留最近5个代币
  }
}

export default TokenListService;
