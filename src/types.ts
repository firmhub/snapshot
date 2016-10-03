export interface ISnapshot {
  name: string
}

export interface ISnapshotTest extends Mocha.ITest {
  snapshot: ISnapshot
  file: string
}

export enum ESnapshotType {
  image,
  text,
}

export interface IFailure {
  format: ESnapshotType
  actual: string
  expected: string
  diff: string
}

export interface IFailureResult extends IFailure {
  snapshotFile: string
  key: string
  title: string
  fullTitle: string
  testFile: string
}

export interface IComparison {
  expected: string
  actual: string
  diff: string
  toString (): string
}

export type PanelState = 'added' | 'removed' | 'changed'

export interface IPanelMap {
  added: Mithril.Component,
  removed: Mithril.Component,
  changed: Mithril.Component
}