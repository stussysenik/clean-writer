declare module 'emoji-unicode' {
  /**
   * Converts an emoji to its Unicode hex code (without U+ prefix)
   * @param emoji - The emoji character to convert
   * @returns The hex code string (e.g., "1f600" for 😀)
   */
  function emojiUnicode(emoji: string): string;
  export default emojiUnicode;
}
