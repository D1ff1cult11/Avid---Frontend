import { VotingServerInfo, VsResponseMessage } from '../../shared/types';

export class Quorum {
  /**
   * Run operations in parallel and wait for f+1 successes.
   * If f+1 responses succeed, resolves early.
   * Otherwise if too many fail to reach f+1, rejects.
   */
  static async awaitQuorum(
    servers: VotingServerInfo[],
    taskFn: (server: VotingServerInfo) => Promise<VsResponseMessage>
  ): Promise<VsResponseMessage[]> {
    const n = servers.length;
    // System-wide n is different, but Quorum works on the 'm' selected servers.
    // The spec "Accept early once >= f+1 positive responses. Timeout remaining."
    // Here we need the global f. Since we selected m = 2f+1, f+1 is just Math.floor(m / 2) + 1.
    const fPlusOne = Math.floor(n / 2) + 1;
    
    return new Promise((resolve, reject) => {
      const successfulResponses: VsResponseMessage[] = [];
      let failCount = 0;
      let isSettled = false;

      servers.forEach(server => {
        taskFn(server).then(res => {
          if (isSettled) return;
          successfulResponses.push(res);
          if (successfulResponses.length >= fPlusOne) {
            isSettled = true;
            resolve(successfulResponses);
          }
        }).catch(err => {
          if (isSettled) return;
          failCount++;
          // If the number of failed servers pushes successful below f+1, we can't reach quorum
          if (n - failCount < fPlusOne) {
            isSettled = true;
            reject(new Error(`Failed to reach quorum. ${failCount} servers failed.`));
          }
        });
      });
    });
  }
}
