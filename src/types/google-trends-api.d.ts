// O pacote "google-trends-api" não publica tipos próprios nem @types no DefinitelyTyped.
declare module 'google-trends-api' {
  function dailyTrends(options: { geo?: string; trendDate?: Date }): Promise<string>;
  function realTimeTrends(options: { geo?: string; category?: string }): Promise<string>;
  function interestOverTime(options: { keyword: string | string[]; geo?: string }): Promise<string>;

  const googleTrends: {
    dailyTrends: typeof dailyTrends;
    realTimeTrends: typeof realTimeTrends;
    interestOverTime: typeof interestOverTime;
  };

  export default googleTrends;
}
