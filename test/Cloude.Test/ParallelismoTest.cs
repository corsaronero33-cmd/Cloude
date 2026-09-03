// Database.PercorsoFile e' una variabile globale: se xUnit facesse girare due
// classi di test contemporaneamente si pesterebbero i piedi puntando allo
// stesso file. Con poche decine di test non serve il parallelismo.
[assembly: Xunit.CollectionBehavior(DisableTestParallelization = true)]
