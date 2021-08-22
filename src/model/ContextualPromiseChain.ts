/** 
 * Allows chaining of multiple promises that all use the same common context. For example
 * with the following functions: 
 * ```
 * a :: C -> X -> Y
 * b :: C -> Y -> Z
 * c :: C -> Z -> R
 * ```
 * we can easily chain them without having to manually keep track of the context C on each 
 * invocation, so they can be called like:
 * ```
 * c(ctx, b(ctx, a(ctx, i)))
 * ```
 * @template C
 * @template A
 */
export default class ContextualPromiseChain<C, A> {
    readonly ctx: Promise<C>; 
    readonly prev: Promise<A>;

    /**
     * Create a new chain.
     * @param {Promise<C>} ctx - The promise providing the context.
     * @param {Promise<A>} prev - The previous promise in the chain.
     */
    constructor(ctx: Promise<C>, prev: Promise<A>) {
        this.ctx = ctx;
        this.prev = prev;
    }

    /**
     * Create a new contextual promise chain
     * @param {Promise<C>} ctx - A promise proving the context of this chain.
     * @returns {ContextualPromiseChainBuilder<C>} A builder needing an inital context to start the chain.
     * @template C
     */
    static withContextProvidedBy<C>(ctx: Promise<C>): ContextualPromiseChainBuilder<C> {
        return new ContextualPromiseChainBuilder(ctx);
    }

    /**
     * Append a new function to the chain
     * @param {function(C, A):B} f - 
     *          A function taking the context and the previous function's result 
     *          and returning the next result (in a promise).
     * @returns {ContextualPromiseChain<C, B>} A new `ContextualPromiseChain` with the same context but the value 
     *          of the given promise.
     * @template B
     */
    then<B>(f: (ctx: C, val: A) => Promise<B>): ContextualPromiseChain<C, B> {
        const next = Promise.all([this.ctx, this.prev]).then(vals => {
            const [ctx, v] = vals;
            return f(ctx, v);
        })
        return new ContextualPromiseChain(this.ctx, next);
    }

    /**
     * @returns {Promise<A>} The last entry in the chain but without the context.
     */
    dropContext(): Promise<A> {
        return this.prev;
    }
}

/**
 * @template C
 */
class ContextualPromiseChainBuilder<C> {
    readonly ctx: Promise<C>;

    constructor(ctx: Promise<C>) {
        this.ctx = ctx;
    }

    /**
     * Start the chain with the given value.
     * @param {A} inital - The chains inital value
     * @template A
     * @returns {ContextualPromiseChain<C, A>} A chain in the given context with the given inital value. 
     */
    andInitialValue<A>(inital: A): ContextualPromiseChain<C, A> {
        return new ContextualPromiseChain(this.ctx, Promise.resolve(inital));
    }
}